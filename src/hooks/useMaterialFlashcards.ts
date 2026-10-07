import {
  useCallback,
  useState,
} from 'react';

import {
  MaterialFlashcards,
} from '../domain/models/MaterialFlashcards';

import {
  generateMaterialFlashcards,
  getSavedMaterialFlashcards,
} from '../data/remote/api/flashcardService';


export const useMaterialFlashcards =
  () => {

    // ========================================================
    // DECK
    // ========================================================

    const [
      deck,
      setDeck,
    ] = useState<
      MaterialFlashcards | null
    >(
      null,
    );


    // ========================================================
    // LOAD STATE
    // ========================================================

    const [
      loading,
      setLoading,
    ] = useState(
      false,
    );


    // ========================================================
    // GENERATE STATE
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
    // ERROR MESSAGE
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
    // LOAD SAVED DECK
    // ========================================================

    const loadSaved =
      useCallback(
        async (
          materialId:
            string | number,
        ): Promise<
          MaterialFlashcards | null
        > => {

          try {

            setLoading(
              true,
            );


            setError(
              null,
            );


            const result =
              await getSavedMaterialFlashcards(
                materialId,
              );


            if (
              result
            ) {

              setDeck(
                result,
              );
            }


            return result;


          } catch (
            loadError
          ) {

            console.warn(
              'Load saved flashcards error:',
              loadError,
            );


            const message =
              resolveErrorMessage(
                loadError,

                'Unable to load '
                + 'saved flashcards.',
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

          count:
            number = 8,
        ): Promise<
          MaterialFlashcards
        > => {

          try {

            setGenerating(
              true,
            );


            setError(
              null,
            );


            const result =
              await generateMaterialFlashcards(
                materialId,
                count,
              );


            setDeck(
              result,
            );


            return result;


          } catch (
            generateError
          ) {

            console.warn(
              'Generate flashcards error:',
              generateError,
            );


            const message =
              resolveErrorMessage(
                generateError,

                'Unable to generate '
                + 'flashcards.',
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

          setDeck(
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

      deck,

      loading,

      generating,

      error,

      loadSaved,

      generate,

      clear,
    };
  };