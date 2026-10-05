import {
  useCallback,
  useState,
} from 'react';

import {
  MaterialSummary,
} from '../domain/models/MaterialSummary';

import {
  generateMaterialSummary,
} from '../data/remote/api/aiService';


export const useMaterialSummary =
  () => {

    const [
      summary,
      setSummary,
    ] = useState<
      MaterialSummary | null
    >(null);


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
    >(null);


    // ========================================================
    // GENERATE
    // ========================================================

    const generate =
      useCallback(
        async (
          materialId:
            string | number,
        ) => {

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
              generateError
                instanceof Error

                ? generateError
                    .message

                : (
                    'Unable to generate '
                    + 'the material summary.'
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
        [],
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
        },
        [],
      );


    return {
      summary,

      generating,

      error,

      generate,

      clear,
    };
  };