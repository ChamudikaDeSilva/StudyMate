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

import {
  getMaterialFlashcardsCache,
  saveMaterialFlashcardsCache,
} from '../data/local/storage/flashcardCache';

import {
  useAuth,
} from './useAuth';


export const useMaterialFlashcards =
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
      deck,
      setDeck,
    ] = useState<
      MaterialFlashcards | null
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


    // ========================================================
    // CACHE DECK SAFELY
    // ========================================================
    //
    // A successful FastAPI request must remain successful even
    // if AsyncStorage fails.
    // ========================================================

    const cacheDeck =
      useCallback(
        async (
          materialId:
            string | number,

          result:
            MaterialFlashcards,
        ): Promise<void> => {

          if (
            !userId
          ) {

            return;
          }


          try {

            await saveMaterialFlashcardsCache(
              userId,
              materialId,
              result,
            );


            console.log(
              '[FLASHCARDS CACHE] Saved',
              {
                materialId:
                  String(
                    materialId,
                  ),
              },
            );


          } catch (
            cacheError
          ) {

            console.warn(
              '[FLASHCARDS CACHE] Save failed:',
              cacheError,
            );
          }
        },
        [
          userId,
        ],
      );


    // ========================================================
    // LOAD CACHED DECK
    // ========================================================

    const loadCached =
      useCallback(
        async (
          materialId:
            string | number,
        ): Promise<
          MaterialFlashcards | null
        > => {

          if (
            !userId
          ) {

            return null;
          }


          try {

            const cached =
              await getMaterialFlashcardsCache(
                userId,
                materialId,
              );


            if (
              cached
            ) {

              setDeck(
                cached,
              );


              setError(
                null,
              );


              console.log(
                '[FLASHCARDS CACHE] Loaded',
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
              '[FLASHCARDS CACHE] Load failed:',
              cacheError,
            );


            return null;
          }
        },
        [
          userId,
        ],
      );


    // ========================================================
    // LOAD SAVED DECK FROM FASTAPI
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


              await cacheDeck(
                materialId,
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
          cacheDeck,
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


            await cacheDeck(
              materialId,
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
          cacheDeck,
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

      loadCached,

      loadSaved,

      generate,

      clearError,

      clear,
    };
  };
