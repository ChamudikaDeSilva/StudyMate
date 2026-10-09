import AsyncStorage
  from '@react-native-async-storage/async-storage';

import {
  MaterialQuiz,
} from '../../../domain/models/MaterialQuiz';


const CACHE_PREFIX =
  'learnloop:offline:v1';


interface MaterialQuizCacheEnvelope {

  data:
    MaterialQuiz;

  cachedAt:
    string;
}


export interface MaterialQuizDraft {

  quizId:
    string;

  selectedAnswers:
    Record<
      string,
      number
    >;

  updatedAt:
    string;
}


const getMaterialQuizCacheKey =
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
      + ':quiz'
    );
  };


const getMaterialQuizDraftKey =
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
      + ':quizDraft'
    );
  };


// ============================================================
// QUIZ CACHE
// ============================================================

export const saveMaterialQuizCache =
  async (
    userId:
      string,

    materialId:
      string | number,

    quiz:
      MaterialQuiz,
  ): Promise<void> => {

    const envelope:
      MaterialQuizCacheEnvelope = {

        data:
          quiz,

        cachedAt:
          new Date()
            .toISOString(),
      };


    await AsyncStorage
      .setItem(
        getMaterialQuizCacheKey(
          userId,
          materialId,
        ),

        JSON.stringify(
          envelope,
        ),
      );
  };


export const getMaterialQuizCache =
  async (
    userId:
      string,

    materialId:
      string | number,
  ): Promise<
    MaterialQuiz | null
  > => {

    const key =
      getMaterialQuizCacheKey(
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
          MaterialQuizCacheEnvelope;


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
        '[QUIZ CACHE] Read failed:',
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
          '[QUIZ CACHE] Corrupt cache cleanup failed:',
          cleanupError,
        );
      }


      return null;
    }
  };


export const removeMaterialQuizCache =
  async (
    userId:
      string,

    materialId:
      string | number,
  ): Promise<void> => {

    await AsyncStorage
      .removeItem(
        getMaterialQuizCacheKey(
          userId,
          materialId,
        ),
      );
  };


// ============================================================
// QUIZ DRAFT
// ============================================================
//
// Only learner selections are stored.
//
// IMPORTANT:
//
// We do NOT store:
// - correctIndex
// - isCorrect
// - explanation
//
// Those remain server-side until submission.
// ============================================================

export const saveMaterialQuizDraft =
  async (
    userId:
      string,

    materialId:
      string | number,

    quizId:
      string | number,

    selectedAnswers:
      Record<
        string,
        number
      >,
  ): Promise<void> => {

    const draft:
      MaterialQuizDraft = {

        quizId:
          String(
            quizId,
          ),

        selectedAnswers,

        updatedAt:
          new Date()
            .toISOString(),
      };


    await AsyncStorage
      .setItem(
        getMaterialQuizDraftKey(
          userId,
          materialId,
        ),

        JSON.stringify(
          draft,
        ),
      );
  };


export const getMaterialQuizDraft =
  async (
    userId:
      string,

    materialId:
      string | number,

    quizId:
      string | number,
  ): Promise<
    MaterialQuizDraft | null
  > => {

    const key =
      getMaterialQuizDraftKey(
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


      const draft =
        JSON.parse(
          raw,
        ) as
          MaterialQuizDraft;


      if (
        !draft
        ||
        !draft.quizId
        ||
        !draft.selectedAnswers
      ) {

        await AsyncStorage
          .removeItem(
            key,
          );


        return null;
      }


      if (
        draft.quizId
        !==
        String(
          quizId,
        )
      ) {

        /*
         * The server/latest cache now points to a different
         * quiz version, so this old draft must not be applied.
         */

        await AsyncStorage
          .removeItem(
            key,
          );


        return null;
      }


      return draft;


    } catch (
      cacheError
    ) {

      console.warn(
        '[QUIZ DRAFT] Read failed:',
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
          '[QUIZ DRAFT] Corrupt draft cleanup failed:',
          cleanupError,
        );
      }


      return null;
    }
  };


export const removeMaterialQuizDraft =
  async (
    userId:
      string,

    materialId:
      string | number,
  ): Promise<void> => {

    await AsyncStorage
      .removeItem(
        getMaterialQuizDraftKey(
          userId,
          materialId,
        ),
      );
  };
