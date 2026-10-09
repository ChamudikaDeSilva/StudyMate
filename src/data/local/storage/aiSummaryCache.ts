import AsyncStorage
  from '@react-native-async-storage/async-storage';

import {
  MaterialSummary,
} from '../../../domain/models/MaterialSummary';

const CACHE_PREFIX =
  'learnloop:offline:v1';

interface MaterialSummaryCacheEnvelope {
  data:
    MaterialSummary;

  cachedAt:
    string;
}

const getMaterialSummaryCacheKey =
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
      + ':summary'
    );
  };

export const saveMaterialSummaryCache =
  async (
    userId:
      string,

    summary:
      MaterialSummary,
  ): Promise<void> => {

    const envelope:
      MaterialSummaryCacheEnvelope = {
        data:
          summary,

        cachedAt:
          new Date()
            .toISOString(),
      };

    await AsyncStorage
      .setItem(
        getMaterialSummaryCacheKey(
          userId,
          summary.materialId,
        ),
        JSON.stringify(
          envelope,
        ),
      );
  };

export const getMaterialSummaryCache =
  async (
    userId:
      string,

    materialId:
      string | number,
  ): Promise<
    MaterialSummary | null
  > => {

    const key =
      getMaterialSummaryCacheKey(
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
          MaterialSummaryCacheEnvelope;

      if (
        !parsed
        ||
        !parsed.data
        ||
        String(
          parsed.data.materialId,
        )
        !==
        String(
          materialId,
        )
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
        '[AI SUMMARY CACHE] Read failed:',
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
          '[AI SUMMARY CACHE] Corrupt cache cleanup failed:',
          cleanupError,
        );
      }

      return null;
    }
  };

export const removeMaterialSummaryCache =
  async (
    userId:
      string,

    materialId:
      string | number,
  ): Promise<void> => {

    await AsyncStorage
      .removeItem(
        getMaterialSummaryCacheKey(
          userId,
          materialId,
        ),
      );
  };
