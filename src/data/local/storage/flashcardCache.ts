import AsyncStorage
  from '@react-native-async-storage/async-storage';

import {
  MaterialFlashcards,
} from '../../../domain/models/MaterialFlashcards';


const CACHE_PREFIX =
  'learnloop:offline:v1';


interface MaterialFlashcardsCacheEnvelope {

  data:
    MaterialFlashcards;

  cachedAt:
    string;
}


const getMaterialFlashcardsCacheKey =
  (
    userId:
      string,

    materialId:
      string | number,
  ): string => {

    return (
      `${CACHE_PREFIX}`
      + `:user:${userId}`
      + `:material:${String(materialId)}`
      + ':flashcards'
    );
  };


export const saveMaterialFlashcardsCache =
  async (
    userId:
      string,

    materialId:
      string | number,

    deck:
      MaterialFlashcards,
  ): Promise<void> => {

    const envelope:
      MaterialFlashcardsCacheEnvelope = {

        data:
          deck,

        cachedAt:
          new Date()
            .toISOString(),
      };


    await AsyncStorage
      .setItem(
        getMaterialFlashcardsCacheKey(
          userId,
          materialId,
        ),

        JSON.stringify(
          envelope,
        ),
      );
  };


export const getMaterialFlashcardsCache =
  async (
    userId:
      string,

    materialId:
      string | number,
  ): Promise<
    MaterialFlashcards | null
  > => {

    const key =
      getMaterialFlashcardsCacheKey(
        userId,
        materialId,
      );


    try {

      const raw =
        await AsyncStorage
          .getItem(
            key,
          );


      if (
        !raw
      ) {

        return null;
      }


      const parsed =
        JSON.parse(
          raw,
        ) as
          MaterialFlashcardsCacheEnvelope;


      if (
        !parsed
        ||
        !parsed.data
      ) {

        await AsyncStorage
          .removeItem(
            key,
          );


        return null;
      }


      return parsed.data;


    } catch (
      cacheError
    ) {

      console.warn(
        '[FLASHCARDS CACHE] Read failed:',
        cacheError,
      );


      try {

        await AsyncStorage
          .removeItem(
            key,
          );

      } catch (
        cleanupError
      ) {

        console.warn(
          '[FLASHCARDS CACHE] Corrupt cache cleanup failed:',
          cleanupError,
        );
      }


      return null;
    }
  };


export const removeMaterialFlashcardsCache =
  async (
    userId:
      string,

    materialId:
      string | number,
  ): Promise<void> => {

    await AsyncStorage
      .removeItem(
        getMaterialFlashcardsCacheKey(
          userId,
          materialId,
        ),
      );
  };
