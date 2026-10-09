import {
  useCallback,
  useState,
} from 'react';

import {
  MaterialSummary,
} from '../domain/models/MaterialSummary';

import {
  generateMaterialSummary,
  getSavedMaterialSummary,
} from '../data/remote/api/aiService';

import {
  getMaterialSummaryCache,
  saveMaterialSummaryCache,
} from '../data/local/storage/aiSummaryCache';

import {
  useAuth,
} from './useAuth';


export const useMaterialSummary =
  () => {

    const {
      user,
    } = useAuth();


    const userId =
      user
        ? String(
            user.id,
          )
        : null;


    const [
      summary,
      setSummary,
    ] = useState<
      MaterialSummary | null
    >(
      null,
    );


    const [
      loading,
      setLoading,
    ] = useState(
      false,
    );


    const [
      generating,
      setGenerating,
    ] = useState(
      false,
    );


    const [
      error,
      setError,
    ] = useState<
      string | null
    >(
      null,
    );


    const resolveErrorMessage =
      useCallback(
        (
          requestError:
            unknown,

          fallback:
            string,
        ): string => {

          if (
            requestError
            instanceof Error
          ) {

            return (
              requestError.message
            );
          }


          return fallback;
        },
        [],
      );


    const cacheSummary =
      useCallback(
        async (
          result:
            MaterialSummary,
        ): Promise<void> => {

          if (
            !userId
          ) {
            return;
          }


          try {

            await saveMaterialSummaryCache(
              userId,
              result,
            );


            console.log(
              '[AI SUMMARY CACHE] Saved',
              {
                materialId:
                  result.materialId,
              },
            );


          } catch (
            cacheError
          ) {

            console.warn(
              '[AI SUMMARY CACHE] Save failed:',
              cacheError,
            );
          }
        },
        [
          userId,
        ],
      );


    const loadCached =
      useCallback(
        async (
          materialId:
            string | number,
        ): Promise<
          MaterialSummary | null
        > => {

          if (
            !userId
          ) {
            return null;
          }


          try {

            const cached =
              await getMaterialSummaryCache(
                userId,
                materialId,
              );


            if (
              cached
            ) {

              setSummary(
                cached,
              );


              setError(
                null,
              );


              console.log(
                '[AI SUMMARY CACHE] Loaded',
                {
                  materialId:
                    String(
                      materialId,
                    ),
                },
              );
            }


            return cached;


          } catch (
            cacheError
          ) {

            console.warn(
              '[AI SUMMARY CACHE] Load failed:',
              cacheError,
            );


            return null;
          }
        },
        [
          userId,
        ],
      );


    const loadSaved =
      useCallback(
        async (
          materialId:
            string | number,
        ): Promise<
          MaterialSummary | null
        > => {

          try {

            setLoading(
              true,
            );


            setError(
              null,
            );


            const result =
              await getSavedMaterialSummary(
                materialId,
              );


            if (
              result
            ) {

              setSummary(
                result,
              );


              await cacheSummary(
                result,
              );
            }


            return result;


          } catch (
            loadError
          ) {

            console.warn(
              'Load saved material '
              + 'summary error:',
              loadError,
            );


            const message =
              resolveErrorMessage(
                loadError,

                'Unable to load '
                + 'the saved summary.',
              );


            setError(
              message,
            );


            throw loadError;


          } finally {

            setLoading(
              false,
            );
          }
        },
        [
          cacheSummary,
          resolveErrorMessage,
        ],
      );


    const generate =
      useCallback(
        async (
          materialId:
            string | number,
        ): Promise<
          MaterialSummary
        > => {

          try {

            setGenerating(
              true,
            );


            setError(
              null,
            );


            const result =
              await generateMaterialSummary(
                materialId,
              );


            setSummary(
              result,
            );


            await cacheSummary(
              result,
            );


            return result;


          } catch (
            generateError
          ) {

            console.warn(
              'Generate material '
              + 'summary error:',
              generateError,
            );


            const message =
              resolveErrorMessage(
                generateError,

                'Unable to generate '
                + 'the material summary.',
              );


            setError(
              message,
            );


            throw generateError;


          } finally {

            setGenerating(
              false,
            );
          }
        },
        [
          cacheSummary,
          resolveErrorMessage,
        ],
      );


    const clearError =
      useCallback(
        () => {

          setError(
            null,
          );
        },
        [],
      );


    const clear =
      useCallback(
        () => {

          setSummary(
            null,
          );


          setError(
            null,
          );


          setLoading(
            false,
          );


          setGenerating(
            false,
          );
        },
        [],
      );


    return {

      summary,

      loading,
      generating,
      error,

      loadCached,
      loadSaved,
      generate,
      clearError,
      clear,
    };
  };
