import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useMaterialFlashcards,
} from './useMaterialFlashcards';

import {
  useNetwork,
} from './useNetwork';

import {
  useOnlineGuard,
} from './useOnlineGuard';


interface UseMaterialFlashcardsScreenParams {

  materialId:
    string;
}


const DEFAULT_CARD_COUNT =
  8;


export const useMaterialFlashcardsScreen = ({
  materialId,
}: UseMaterialFlashcardsScreenParams) => {

  const {

    deck,

    loading,

    generating,

    error,

    loadCached,

    loadSaved,

    generate,

    clearError,

  } = useMaterialFlashcards();


  const {
    isOnline,

    initialized:
      networkInitialized,

  } = useNetwork();


  const {
    runOnlineAction,
  } = useOnlineGuard();


  const [
    screenError,
    setScreenError,
  ] = useState<
    string | null
  >(
    null,
  );


  const [
    initializing,
    setInitializing,
  ] = useState(
    true,
  );


  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(
    0,
  );


  const [
    answerVisible,
    setAnswerVisible,
  ] = useState(
    false,
  );


  const initialRequestStarted =
    useRef(
      false,
    );


  const currentCard =
    useMemo(
      () => {

        if (
          !deck
          ||
          deck.cards.length ===
            0
        ) {

          return null;
        }


        return (
          deck.cards[
            currentIndex
          ]
          ??
          null
        );
      },
      [
        deck,
        currentIndex,
      ],
    );


  const resetStudyPosition =
    useCallback(
      () => {

        setCurrentIndex(
          0,
        );


        setAnswerVisible(
          false,
        );
      },
      [],
    );


  // =========================================================
  // INITIAL LOAD
  // =========================================================
  //
  // 1. Read cached deck first.
  //
  // 2. Offline:
  //      cached -> study normally
  //      no cache -> friendly message
  //
  // 3. Online:
  //      GET saved deck from FastAPI
  //
  // 4. If missing:
  //      generate once
  //
  // Every successful GET/POST refreshes local cache.
  // =========================================================

  const initialize =
    useCallback(
      async () => {

        if (
          !networkInitialized
        ) {

          return;
        }


        let cachedDeckFound =
          false;


        try {

          setInitializing(
            true,
          );


          setScreenError(
            null,
          );


          clearError();


          const cached =
            await loadCached(
              materialId,
            );


          cachedDeckFound =
            Boolean(
              cached,
            );


          if (
            cached
          ) {

            resetStudyPosition();
          }


          // ==================================================
          // OFFLINE
          // ==================================================

          if (
            !isOnline
          ) {

            if (
              !cachedDeckFound
            ) {

              setScreenError(
                'No cached flashcards are available offline. '
                + 'Connect to the internet and open this deck '
                + 'once to save an offline copy.',
              );
            }


            return;
          }


          // ==================================================
          // ONLINE - CHECK FASTAPI
          // ==================================================

          const saved =
            await loadSaved(
              materialId,
            );


          if (
            saved
          ) {

            resetStudyPosition();

            return;
          }


          // ==================================================
          // ONLINE - GENERATE IF MISSING
          // ==================================================

          await generate(
            materialId,
            DEFAULT_CARD_COUNT,
          );


          resetStudyPosition();


        } catch {

          /*
           * If online loading fails, do not automatically
           * trigger another Gemini request.
           *
           * Any already-loaded cached deck remains usable.
           */

        } finally {

          setInitializing(
            false,
          );
        }

      },
      [
        clearError,
        generate,
        isOnline,
        loadCached,
        loadSaved,
        materialId,
        networkInitialized,
        resetStudyPosition,
      ],
    );


  useEffect(
    () => {

      if (
        !networkInitialized
      ) {

        return;
      }


      if (
        initialRequestStarted
          .current
      ) {

        return;
      }


      initialRequestStarted
        .current =
          true;


      void initialize();

    },
    [
      initialize,
      networkInitialized,
    ],
  );


  const toggleAnswer =
    useCallback(
      () => {

        if (
          !currentCard
        ) {

          return;
        }


        setAnswerVisible(
          current =>
            !current,
        );
      },
      [
        currentCard,
      ],
    );


  const previous =
    useCallback(
      () => {

        setCurrentIndex(
          current => {

            if (
              current <=
                0
            ) {

              return 0;
            }


            return (
              current - 1
            );
          },
        );


        setAnswerVisible(
          false,
        );
      },
      [],
    );


  const next =
    useCallback(
      () => {

        if (
          !deck
        ) {

          return;
        }


        setCurrentIndex(
          current => {

            const finalIndex =
              deck.cards.length
              - 1;


            if (
              current >=
                finalIndex
            ) {

              return finalIndex;
            }


            return (
              current + 1
            );
          },
        );


        setAnswerVisible(
          false,
        );
      },
      [
        deck,
      ],
    );


  // =========================================================
  // GENERATE AGAIN
  // =========================================================
  //
  // Strictly online-only.
  //
  // If offline, the current cached deck stays visible.
  // =========================================================

  const generateAgain =
    useCallback(
      () => {

        runOnlineAction(
          'AI Flashcards',
          async () => {

            setScreenError(
              null,
            );


            clearError();


            try {

              await generate(
                materialId,
                DEFAULT_CARD_COUNT,
              );


              resetStudyPosition();


            } catch {

              /*
               * useMaterialFlashcards already owns API error
               * state.
               */
            }
          },
        );

      },
      [
        clearError,
        generate,
        materialId,
        resetStudyPosition,
        runOnlineAction,
      ],
    );


  const retry =
    useCallback(
      async () => {

        setScreenError(
          null,
        );


        clearError();


        await initialize();

      },
      [
        clearError,
        initialize,
      ],
    );


  const totalCards =
    deck?.cards.length
    ??
    0;


  const displayPosition =
    totalCards >
      0
      ? currentIndex + 1
      : 0;


  const canGoPrevious =
    currentIndex >
    0;


  const canGoNext =
    (
      totalCards >
        0
      &&
      currentIndex
        <
      totalCards - 1
    );


  return {

    deck,

    currentCard,

    currentIndex,

    displayPosition,

    totalCards,

    answerVisible,

    initializing,

    loading,

    generating,

    busy:
      initializing
      ||
      loading
      ||
      generating,

    error:
      screenError
      ??
      error,

    canGoPrevious,

    canGoNext,

    toggleAnswer,

    previous,

    next,

    generateAgain,

    retry,
  };
};
