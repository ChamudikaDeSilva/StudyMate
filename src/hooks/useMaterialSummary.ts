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


export const useMaterialSummary =
  () => {

    // ========================================================
    // SUMMARY
    // ========================================================

    const [
      summary,
      setSummary,
    ] = useState<
      MaterialSummary | null
    >(
      null,
    );


    // ========================================================
    // SAVED SUMMARY LOADING STATE
    // ========================================================

    const [
      loading,
      setLoading,
    ] = useState(
      false,
    );


    // ========================================================
    // GENERATION STATE
    // ========================================================

    const [
      generating,
      setGenerating,
    ] = useState(
      false,
    );


    // ========================================================
    // ERROR
    // ========================================================

    const [
      error,
      setError,
    ] = useState<
      string | null
    >(
      null,
    );


    // ========================================================
    // ERROR MESSAGE HELPER
    // ========================================================

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


    // ========================================================
    // LOAD SAVED SUMMARY
    // ========================================================

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


            // =================================================
            // SAVED SUMMARY FOUND
            // =================================================

            if (
              result
            ) {

              setSummary(
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
          resolveErrorMessage,
        ],
      );


    // ========================================================
    // GENERATE / REGENERATE
    // ========================================================

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
          resolveErrorMessage,
        ],
      );


    // ========================================================
    // CLEAR
    // ========================================================

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


    // ========================================================
    // RETURN
    // ========================================================

    return {

      // Data
      summary,

      // States
      loading,
      generating,
      error,

      // Actions
      loadSaved,
      generate,
      clear,
    };
  };