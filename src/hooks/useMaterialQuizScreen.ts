import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  QuizSubmissionResult,
} from '../domain/models/MaterialQuiz';

import {
  useMaterialQuiz,
} from './useMaterialQuiz';


interface Params {

  materialId:
    string;

  forceGenerate?:
    boolean;
}


const DEFAULT_QUESTION_COUNT =
  10;


export const useMaterialQuizScreen = ({
  materialId,
  forceGenerate = false,
}: Params) => {

  const {

    quiz,

    loading,

    generating,

    submitting,

    error,

    loadLatest,

    generate,

    submit,

  } = useMaterialQuiz();


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
    selectedAnswers,
    setSelectedAnswers,
  ] = useState<
    Record<
      string,
      number
    >
  >(
    {},
  );


  const initialRequestStarted =
    useRef(
      false,
    );


  const resetQuizState =
    useCallback(
      () => {

        setCurrentIndex(
          0,
        );


        setSelectedAnswers(
          {},
        );
      },
      [],
    );


  // =========================================================
  // INITIALIZE
  // =========================================================

  const initialize =
    useCallback(
      async () => {

        try {

          setInitializing(
            true,
          );


          // =================================================
          // FORCE NEW QUIZ
          // =================================================

          if (
            forceGenerate
          ) {

            await generate(
              materialId,
              DEFAULT_QUESTION_COUNT,
            );


            resetQuizState();

            return;
          }


          // =================================================
          // LOAD SAVED
          // =================================================

          const saved =
            await loadLatest(
              materialId,
            );


          if (
            saved
          ) {

            resetQuizState();

            return;
          }


          // =================================================
          // NONE SAVED
          // =================================================

          await generate(
            materialId,
            DEFAULT_QUESTION_COUNT,
          );


          resetQuizState();


        } catch {

          /*
           * Hook owns error state.
           *
           * A real GET failure does not
           * automatically call Gemini.
           */

        } finally {

          setInitializing(
            false,
          );
        }

      },
      [
        forceGenerate,
        generate,
        loadLatest,
        materialId,
        resetQuizState,
      ],
    );


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
  // CURRENT QUESTION
  // =========================================================

  const currentQuestion =
    useMemo(
      () => {

        if (
          !quiz
          ||
          quiz.questions.length ===
            0
        ) {

          return null;
        }


        return (
          quiz.questions[
            currentIndex
          ]
          ??
          null
        );
      },
      [
        quiz,
        currentIndex,
      ],
    );


  const selectedIndex =
    currentQuestion
      ? (
          selectedAnswers[
            currentQuestion.id
          ]
          ??
          null
        )
      : null;


  // =========================================================
  // ANSWER COUNT
  // =========================================================

  const answeredCount =
    useMemo(
      () => {

        if (
          !quiz
        ) {

          return 0;
        }


        return (
          quiz.questions
          .filter(
            question =>
              Object.prototype
                .hasOwnProperty
                .call(
                  selectedAnswers,
                  question.id,
                ),
          )
          .length
        );
      },
      [
        quiz,
        selectedAnswers,
      ],
    );


  // =========================================================
  // SELECT ANSWER
  // =========================================================

  const selectAnswer =
    useCallback(
      (
        questionId:
          string,

        optionIndex:
          number,
      ) => {

        setSelectedAnswers(
          current => ({
            ...current,

            [questionId]:
              optionIndex,
          }),
        );
      },
      [],
    );


  // =========================================================
  // PREVIOUS
  // =========================================================

  const previous =
    useCallback(
      () => {

        setCurrentIndex(
          current =>
            Math.max(
              0,
              current - 1,
            ),
        );
      },
      [],
    );


  // =========================================================
  // NEXT
  // =========================================================

  const next =
    useCallback(
      () => {

        if (
          !quiz
        ) {

          return;
        }


        setCurrentIndex(
          current =>
            Math.min(
              quiz.questions.length - 1,
              current + 1,
            ),
        );
      },
      [
        quiz,
      ],
    );


  // =========================================================
  // SUBMIT
  // =========================================================

  const submitQuiz =
    useCallback(
      async (): Promise<
        QuizSubmissionResult | null
      > => {

        if (
          !quiz
        ) {

          return null;
        }


        const answers =
          quiz.questions.map(
            question => ({

              questionId:
                question.id,

              selectedIndex:
                Object.prototype
                  .hasOwnProperty
                  .call(
                    selectedAnswers,
                    question.id,
                  )
                  ? selectedAnswers[
                      question.id
                    ]
                  : null,
            }),
          );


        return (
          await submit(
            quiz.quizId,
            answers,
          )
        );

      },
      [
        quiz,
        selectedAnswers,
        submit,
      ],
    );


  const totalQuestions =
    quiz?.questions.length
    ??
    0;


  const displayPosition =
    totalQuestions > 0
      ? currentIndex + 1
      : 0;


  const canGoPrevious =
    currentIndex > 0;


  const canGoNext =
    (
      currentIndex
      <
      totalQuestions - 1
    );


  const isLastQuestion =
    (
      totalQuestions > 0
      &&
      currentIndex ===
        totalQuestions - 1
    );


  return {

    quiz,

    currentQuestion,

    currentIndex,

    selectedIndex,

    selectedAnswers,

    answeredCount,

    totalQuestions,

    displayPosition,

    initializing,

    loading,

    generating,

    submitting,

    busy:
      initializing
      ||
      loading
      ||
      generating
      ||
      submitting,

    error,

    canGoPrevious,

    canGoNext,

    isLastQuestion,

    selectAnswer,

    previous,

    next,

    submitQuiz,

    retry:
      initialize,
  };
};