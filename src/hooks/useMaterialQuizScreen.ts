import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  MaterialQuiz,
  QuizSubmissionResult,
} from '../domain/models/MaterialQuiz';

import {
  getMaterialQuizDraft,
  removeMaterialQuizDraft,
  saveMaterialQuizDraft,
} from '../data/local/storage/quizCache';

import {
  useAuth,
} from './useAuth';

import {
  useMaterialQuiz,
} from './useMaterialQuiz';

import {
  useNetwork,
} from './useNetwork';


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
    user,
  } = useAuth();


  const userId =
    user
      ? String(
          user.id,
        )
      : null;


  const {
    isOnline,

    initialized:
      networkInitialized,

  } = useNetwork();


  const {

    quiz,

    loading,

    generating,

    submitting,

    error,

    loadCached,

    loadLatest,

    generate,

    submit,

    clearError,

  } = useMaterialQuiz();


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


  // =========================================================
  // RESTORE DRAFT FOR ONE QUIZ VERSION
  // =========================================================

  const restoreDraft =
    useCallback(
      async (
        activeQuiz:
          MaterialQuiz,
      ) => {

        setCurrentIndex(
          0,
        );


        if (
          !userId
        ) {

          setSelectedAnswers(
            {},
          );


          return;
        }


        try {

          const draft =
            await getMaterialQuizDraft(
              userId,
              materialId,
              activeQuiz.quizId,
            );


          if (
            draft
          ) {

            setSelectedAnswers(
              draft.selectedAnswers,
            );


            console.log(
              '[QUIZ DRAFT] Restored',
              {
                materialId,

                quizId:
                  activeQuiz.quizId,

                answerCount:
                  Object.keys(
                    draft.selectedAnswers,
                  ).length,
              },
            );


            return;
          }


          setSelectedAnswers(
            {},
          );


        } catch (
          draftError
        ) {

          console.warn(
            '[QUIZ DRAFT] Restore failed:',
            draftError,
          );


          setSelectedAnswers(
            {},
          );
        }
      },
      [
        materialId,
        userId,
      ],
    );


  // =========================================================
  // INITIALIZE
  // =========================================================
  //
  // NORMAL FLOW:
  //
  // local quiz cache
  //      ↓
  // offline -> restore draft and use cache
  //      ↓
  // online -> GET latest FastAPI quiz
  //      ↓
  // missing -> generate once
  //
  // FORCE GENERATE:
  //
  // online -> generate a brand-new quiz
  //
  // offline -> fall back to cached quiz if one exists,
  // otherwise show a friendly connection message.
  // =========================================================

  const initialize =
    useCallback(
      async () => {

        if (
          !networkInitialized
        ) {

          return;
        }


        try {

          setInitializing(
            true,
          );


          setScreenError(
            null,
          );


          clearError();


          // =================================================
          // STEP 1
          // LOCAL CACHE FIRST
          // =================================================

          const cached =
            await loadCached(
              materialId,
            );


          // =================================================
          // STEP 2
          // FORCE NEW QUIZ
          // =================================================

          if (
            forceGenerate
          ) {

            if (
              !isOnline
            ) {

              if (
                cached
              ) {

                await restoreDraft(
                  cached,
                );


                return;
              }


              setScreenError(
                'A new quiz requires an internet connection. '
                + 'No cached quiz is available for this material.',
              );


              return;
            }


            const generated =
              await generate(
                materialId,
                DEFAULT_QUESTION_COUNT,
              );


            await restoreDraft(
              generated,
            );


            return;
          }


          // =================================================
          // STEP 3
          // OFFLINE
          // =================================================

          if (
            !isOnline
          ) {

            if (
              cached
            ) {

              await restoreDraft(
                cached,
              );


              return;
            }


            setScreenError(
              'No cached quiz is available offline. '
              + 'Connect to the internet and open this quiz '
              + 'once to save an offline copy.',
            );


            return;
          }


          // =================================================
          // STEP 4
          // ONLINE - LOAD LATEST
          // =================================================

          const saved =
            await loadLatest(
              materialId,
            );


          if (
            saved
          ) {

            await restoreDraft(
              saved,
            );


            return;
          }


          // =================================================
          // STEP 5
          // ONLINE - GENERATE IF MISSING
          // =================================================

          const generated =
            await generate(
              materialId,
              DEFAULT_QUESTION_COUNT,
            );


          await restoreDraft(
            generated,
          );


        } catch {

          /*
           * The data hook owns API error state.
           *
           * If a cached quiz was already loaded before an
           * online failure, it remains visible.
           *
           * We deliberately do not trigger another Gemini
           * request after a real GET failure.
           */

        } finally {

          setInitializing(
            false,
          );
        }

      },
      [
        clearError,
        forceGenerate,
        generate,
        isOnline,
        loadCached,
        loadLatest,
        materialId,
        networkInitialized,
        restoreDraft,
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
  // SAVE CURRENT DRAFT
  // =========================================================

  const persistDraft =
    useCallback(
      async (
        answers:
          Record<
            string,
            number
          >,
      ) => {

        if (
          !userId
          ||
          !quiz
        ) {

          return;
        }


        try {

          await saveMaterialQuizDraft(
            userId,
            materialId,
            quiz.quizId,
            answers,
          );


        } catch (
          draftError
        ) {

          console.warn(
            '[QUIZ DRAFT] Save failed:',
            draftError,
          );
        }
      },
      [
        materialId,
        quiz,
        userId,
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

        const nextAnswers = {
          ...selectedAnswers,

          [questionId]:
            optionIndex,
        };


        setSelectedAnswers(
          nextAnswers,
        );


        void persistDraft(
          nextAnswers,
        );

      },
      [
        persistDraft,
        selectedAnswers,
      ],
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
  //
  // Scoring remains server-side.
  //
  // Offline submission is deliberately blocked while the
  // locally saved answers remain intact.
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


        if (
          networkInitialized
          &&
          !isOnline
        ) {

          throw new Error(
            'An internet connection is required to submit '
            + 'and score this quiz. Your answers are saved '
            + 'on this device and will be restored when you '
            + 'return.',
          );
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


        const response =
          await submit(
            quiz.quizId,
            answers,
          );


        /*
         * The backend has accepted and scored this attempt,
         * so the local unsent draft is no longer needed.
         */
        if (
          userId
        ) {

          try {

            await removeMaterialQuizDraft(
              userId,
              materialId,
            );


          } catch (
            draftError
          ) {

            console.warn(
              '[QUIZ DRAFT] Clear after submit failed:',
              draftError,
            );
          }
        }


        return response;

      },
      [
        isOnline,
        materialId,
        networkInitialized,
        quiz,
        selectedAnswers,
        submit,
        userId,
      ],
    );


  // =========================================================
  // RETRY
  // =========================================================

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


  const totalQuestions =
    quiz?.questions.length
    ??
    0;


  const displayPosition =
    totalQuestions >
      0
      ? currentIndex + 1
      : 0;


  const canGoPrevious =
    currentIndex >
    0;


  const canGoNext =
    (
      currentIndex
      <
      totalQuestions - 1
    );


  const isLastQuestion =
    (
      totalQuestions >
        0
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

    error:
      screenError
      ??
      error,

    canGoPrevious,

    canGoNext,

    isLastQuestion,

    selectAnswer,

    previous,

    next,

    submitQuiz,

    retry,
  };
};
