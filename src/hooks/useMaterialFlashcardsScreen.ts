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

    loadSaved,

    generate,

  } = useMaterialFlashcards();


  // =========================================================
  // INITIALIZING
  // =========================================================

  const [
    initializing,
    setInitializing,
  ] = useState(
    true,
  );


  // =========================================================
  // CURRENT CARD
  // =========================================================

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(
    0,
  );


  // =========================================================
  // QUESTION / ANSWER FACE
  // =========================================================

  const [
    answerVisible,
    setAnswerVisible,
  ] = useState(
    false,
  );


  // =========================================================
  // INITIAL REQUEST GUARD
  // =========================================================

  const initialRequestStarted =
    useRef(
      false,
    );


  // =========================================================
  // CURRENT CARD
  // =========================================================

  const currentCard =
    useMemo(
      () => {

        if (
          !deck
          ||
          deck.cards.length === 0
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


  // =========================================================
  // RESET STUDY POSITION
  // =========================================================

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
  //
  // GET saved deck
  //      ↓
  // exists → show it
  //
  // missing → POST generate once
  // =========================================================

  const initialize =
    useCallback(
      async () => {

        try {

          setInitializing(
            true,
          );


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


          await generate(
            materialId,
            DEFAULT_CARD_COUNT,
          );


          resetStudyPosition();


        } catch {

          /*
           * Real GET failures must not
           * automatically call Gemini.
           *
           * useMaterialFlashcards()
           * already owns error state.
           */

        } finally {

          setInitializing(
            false,
          );
        }

      },
      [
        generate,
        loadSaved,
        materialId,
        resetStudyPosition,
      ],
    );


  // =========================================================
  // INITIAL EFFECT
  // =========================================================

  useEffect(
    () => {

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
    ],
  );


  // =========================================================
  // TOGGLE ANSWER
  // =========================================================

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


  // =========================================================
  // PREVIOUS CARD
  // =========================================================

  const previous =
    useCallback(
      () => {

        setCurrentIndex(
          current => {

            if (
              current <= 0
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


  // =========================================================
  // NEXT CARD
  // =========================================================

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
              current >= finalIndex
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

  const generateAgain =
    useCallback(
      async () => {

        try {

          await generate(
            materialId,
            DEFAULT_CARD_COUNT,
          );


          resetStudyPosition();

        } catch {

          /*
           * Hook already stores
           * the error.
           */
        }

      },
      [
        generate,
        materialId,
        resetStudyPosition,
      ],
    );


  // =========================================================
  // RETRY
  // =========================================================

  const retry =
    useCallback(
      async () => {

        await initialize();

      },
      [
        initialize,
      ],
    );


  // =========================================================
  // DERIVED STATE
  // =========================================================

  const totalCards =
    deck?.cards.length
    ??
    0;


  const displayPosition =
    totalCards > 0
      ? currentIndex + 1
      : 0;


  const canGoPrevious =
    currentIndex > 0;


  const canGoNext =
    (
      totalCards > 0
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