import AsyncStorage
  from '@react-native-async-storage/async-storage';

import {
  Subject,
} from '../../../domain/models/Subject';

import {
  Material,
} from '../../../domain/models/Material';


// ============================================================
// TYPES
// ============================================================

interface CacheEnvelope<T> {
  data: T;
  cachedAt: string;
}


// ============================================================
// CACHE VERSION
// ============================================================
//
// If the cache structure changes later,
// increment:
//
// v1 -> v2
//

const CACHE_PREFIX =
  'learnloop:offline:v1';


// ============================================================
// KEY HELPERS
// ============================================================

const subjectsKey = (
  userId:
    string | number,
): string => {

  return (
    `${CACHE_PREFIX}`
    + `:user:${userId}`
    + ':subjects'
  );
};


const materialsKey = (
  userId:
    string | number,

  subjectId:
    string | number,
): string => {

  return (
    `${CACHE_PREFIX}`
    + `:user:${userId}`
    + `:subject:${subjectId}`
    + ':materials'
  );
};


// ============================================================
// GENERIC SAVE
// ============================================================

const saveValue =
  async <T>(
    key:
      string,

    data:
      T,
  ): Promise<void> => {

    const envelope:
      CacheEnvelope<T> = {
        data,

        cachedAt:
          new Date()
            .toISOString(),
      };


    await AsyncStorage.setItem(
      key,
      JSON.stringify(
        envelope,
      ),
    );
  };


// ============================================================
// GENERIC READ
// ============================================================

const readValue =
  async <T>(
    key:
      string,
  ): Promise<
    CacheEnvelope<T> | null
  > => {

    try {

      const raw =
        await AsyncStorage.getItem(
          key,
        );


      if (!raw) {
        return null;
      }


      const parsed =
        JSON.parse(
          raw,
        ) as CacheEnvelope<T>;


      if (
        !parsed
        ||
        !(
          'data'
          in
          parsed
        )
      ) {
        return null;
      }


      return parsed;

    } catch (error) {

      console.warn(
        'Offline cache read failed:',
        error,
      );


      return null;
    }
  };


// ============================================================
// SUBJECT CACHE
// ============================================================

export const saveSubjectsCache =
  async (
    userId:
      string | number,

    subjects:
      Subject[],
  ): Promise<void> => {

    try {

      await saveValue(
        subjectsKey(
          userId,
        ),
        subjects,
      );

    } catch (error) {

      console.warn(
        'Unable to save subjects cache:',
        error,
      );
    }
  };


export const getSubjectsCache =
  async (
    userId:
      string | number,
  ): Promise<
    Subject[]
  > => {

    const cached =
      await readValue<
        Subject[]
      >(
        subjectsKey(
          userId,
        ),
      );


    return (
      cached?.data
      ??
      []
    );
  };


// ============================================================
// MATERIAL CACHE
// ============================================================

export const saveMaterialsCache =
  async (
    userId:
      string | number,

    subjectId:
      string | number,

    materials:
      Material[],
  ): Promise<void> => {

    try {

      const key =
        materialsKey(
          userId,
          subjectId,
        );


      // ======================================================
      // TEMPORARY DEBUG LOG
      // ======================================================

      console.log(
        '[OFFLINE CACHE] Saving materials',
        {
          key,

          userId,

          subjectId,

          count:
            materials.length,

          titles:
            materials.map(
              material =>
                material.title,
            ),
        },
      );


      await saveValue(
        key,
        materials,
      );


      console.log(
        '[OFFLINE CACHE] Materials saved successfully',
        {
          key,
          count:
            materials.length,
        },
      );

    } catch (error) {

      console.warn(
        'Unable to save materials cache:',
        error,
      );
    }
  };


export const getMaterialsCache =
  async (
    userId:
      string | number,

    subjectId:
      string | number,
  ): Promise<
    Material[]
  > => {

    const key =
      materialsKey(
        userId,
        subjectId,
      );


    const cached =
      await readValue<
        Material[]
      >(
        key,
      );


    // ========================================================
    // TEMPORARY DEBUG LOG
    // ========================================================

    console.log(
      '[OFFLINE CACHE] Reading materials',
      {
        key,

        userId,

        subjectId,

        found:
          cached !==
          null,

        count:
          cached?.data.length
          ??
          0,

        titles:
          cached?.data.map(
            material =>
              material.title,
          )
          ??
          [],
      },
    );


    return (
      cached?.data
      ??
      []
    );
  };


// ============================================================
// CACHE TIMESTAMP
// ============================================================

export const getSubjectsCachedAt =
  async (
    userId:
      string | number,
  ): Promise<
    string | null
  > => {

    const cached =
      await readValue<
        Subject[]
      >(
        subjectsKey(
          userId,
        ),
      );


    return (
      cached?.cachedAt
      ??
      null
    );
  };


export const getMaterialsCachedAt =
  async (
    userId:
      string | number,

    subjectId:
      string | number,
  ): Promise<
    string | null
  > => {

    const cached =
      await readValue<
        Material[]
      >(
        materialsKey(
          userId,
          subjectId,
        ),
      );


    return (
      cached?.cachedAt
      ??
      null
    );
  };


// ============================================================
// REMOVE ONE SUBJECT'S MATERIAL CACHE
// ============================================================

export const removeMaterialsCache =
  async (
    userId:
      string | number,

    subjectId:
      string | number,
  ): Promise<void> => {

    try {

      const key =
        materialsKey(
          userId,
          subjectId,
        );


      await AsyncStorage.removeItem(
        key,
      );


      console.log(
        '[OFFLINE CACHE] Material cache removed',
        {
          key,
          userId,
          subjectId,
        },
      );

    } catch (error) {

      console.warn(
        'Unable to remove materials cache:',
        error,
      );
    }
  };


// ============================================================
// REMOVE SUBJECT CACHE
// ============================================================

export const removeSubjectsCache =
  async (
    userId:
      string | number,
  ): Promise<void> => {

    try {

      await AsyncStorage.removeItem(
        subjectsKey(
          userId,
        ),
      );

    } catch (error) {

      console.warn(
        'Unable to remove subjects cache:',
        error,
      );
    }
  };


// ============================================================
// CLEAR ALL OFFLINE DATA FOR USER
// ============================================================
//
// Useful later during logout.
//
// This prevents cached data from one
// account being visible to another user.
//

export const clearUserOfflineCache =
  async (
    userId:
      string | number,
  ): Promise<void> => {

    try {

      const allKeys =
        await AsyncStorage.getAllKeys();


      const userPrefix =
        `${CACHE_PREFIX}`
        + `:user:${userId}`;


      const userKeys =
        allKeys.filter(
          key =>
            key.startsWith(
              userPrefix,
            ),
        );


      if (
        userKeys.length ===
        0
      ) {
        return;
      }


      await Promise.all(
        userKeys.map(
          key =>
            AsyncStorage.removeItem(
              key,
            ),
        ),
      );


      console.log(
        '[OFFLINE CACHE] User cache cleared',
        {
          userId,
          removedKeys:
            userKeys,
        },
      );

    } catch (error) {

      console.warn(
        'Unable to clear offline cache:',
        error,
      );
    }
  };


// ============================================================
// DEBUG / DEVELOPMENT HELPER
// ============================================================
//
// Returns only LearnLoop offline cache keys.
//

export const getOfflineCacheKeys =
  async (): Promise<
    readonly string[]
  > => {

    try {

      const allKeys =
        await AsyncStorage.getAllKeys();


      const learnLoopKeys =
        allKeys.filter(
          key =>
            key.startsWith(
              CACHE_PREFIX,
            ),
        );


      console.log(
        '[OFFLINE CACHE] Current keys',
        learnLoopKeys,
      );


      return learnLoopKeys;

    } catch (error) {

      console.warn(
        'Unable to read offline cache keys:',
        error,
      );


      return [];
    }
  };