import {
  useCallback,
  useState,
} from 'react';

import {
  MaterialQuiz,
  QuizAnswerSubmission,
  QuizSubmissionResult,
} from '../domain/models/MaterialQuiz';

import {
  generateMaterialQuiz,
  getLatestMaterialQuiz,
  submitMaterialQuiz,
} from '../data/remote/api/quizService';

import {
  getMaterialQuizCache,
  removeMaterialQuizDraft,
  saveMaterialQuizCache,
} from '../data/local/storage/quizCache';

import {
  useAuth,
} from './useAuth';


export const useMaterialQuiz =
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
      quiz,
      setQuiz,
    ] = useState<
      MaterialQuiz | null
    >(
      null,
    );


    const [
      result,
      setResult,
    ] = useState<
      QuizSubmissionResult | null
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
      submitting,
      setSubmitting,
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
        ) => {

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
    // CACHE QUIZ SAFELY
    // ========================================================

    const cacheQuiz =
      useCallback(
        async (
          materialId:
            string | number,

          value:
            MaterialQuiz,
        ): Promise<void> => {

          if (
            !userId
          ) {

            return;
          }


          try {

            await saveMaterialQuizCache(
              userId,
              materialId,
              value,
            );


            console.log(
              '[QUIZ CACHE] Saved',
              {
                materialId:
                  String(
                    materialId,
                  ),

                quizId:
                  value.quizId,
              },
            );


          } catch (
            cacheError
          ) {

            console.warn(
              '[QUIZ CACHE] Save failed:',
              cacheError,
            );
          }
        },
        [
          userId,
        ],
      );


    // ========================================================
    // LOAD CACHED QUIZ
    // ========================================================

    const loadCached =
      useCallback(
        async (
          materialId:
            string | number,
        ): Promise<
          MaterialQuiz | null
        > => {

          if (
            !userId
          ) {

            return null;
          }


          try {

            const cached =
              await getMaterialQuizCache(
                userId,
                materialId,
              );


            if (
              cached
            ) {

              setQuiz(
                cached,
              );


              setError(
                null,
              );


              console.log(
                '[QUIZ CACHE] Loaded',
                {
                  materialId:
                    String(
                      materialId,
                    ),

                  quizId:
                    cached.quizId,
                },
              );
            }


            return cached;


          } catch (
            cacheError
          ) {

            console.warn(
              '[QUIZ CACHE] Load failed:',
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
    // LOAD LATEST FROM FASTAPI
    // ========================================================

    const loadLatest =
      useCallback(
        async (
          materialId:
            string | number,
        ) => {

          try {

            setLoading(
              true,
            );


            setError(
              null,
            );


            const response =
              await getLatestMaterialQuiz(
                materialId,
              );


            if (
              response
            ) {

              setQuiz(
                response,
              );


              await cacheQuiz(
                materialId,
                response,
              );
            }


            return response;


          } catch (
            requestError
          ) {

            console.warn(
              'Load quiz error:',
              requestError,
            );


            setError(
              resolveErrorMessage(
                requestError,

                'Unable to load quiz.',
              ),
            );


            throw requestError;


          } finally {

            setLoading(
              false,
            );
          }
        },
        [
          cacheQuiz,
          resolveErrorMessage,
        ],
      );


    // ========================================================
    // GENERATE NEW QUIZ
    // ========================================================

    const generate =
      useCallback(
        async (
          materialId:
            string | number,

          count:
            number = 10,
        ) => {

          try {

            setGenerating(
              true,
            );


            setError(
              null,
            );


            setResult(
              null,
            );


            const response =
              await generateMaterialQuiz(
                materialId,
                count,
              );


            setQuiz(
              response,
            );


            await cacheQuiz(
              materialId,
              response,
            );


            /*
             * A newly generated quiz has a new quiz ID.
             * Previous answers must never be reused.
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
                  '[QUIZ DRAFT] Unable to clear old draft:',
                  draftError,
                );
              }
            }


            return response;


          } catch (
            requestError
          ) {

            console.warn(
              'Generate quiz error:',
              requestError,
            );


            setError(
              resolveErrorMessage(
                requestError,

                'Unable to generate quiz.',
              ),
            );


            throw requestError;


          } finally {

            setGenerating(
              false,
            );
          }
        },
        [
          cacheQuiz,
          resolveErrorMessage,
          userId,
        ],
      );


    // ========================================================
    // SUBMIT
    // ========================================================

    const submit =
      useCallback(
        async (
          quizId:
            string | number,

          answers:
            QuizAnswerSubmission[],
        ) => {

          try {

            setSubmitting(
              true,
            );


            setError(
              null,
            );


            const response =
              await submitMaterialQuiz(
                quizId,
                answers,
              );


            setResult(
              response,
            );


            return response;


          } catch (
            requestError
          ) {

            console.warn(
              'Submit quiz error:',
              requestError,
            );


            setError(
              resolveErrorMessage(
                requestError,

                'Unable to submit quiz.',
              ),
            );


            throw requestError;


          } finally {

            setSubmitting(
              false,
            );
          }
        },
        [
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


    return {

      quiz,

      result,

      loading,

      generating,

      submitting,

      error,

      loadCached,

      loadLatest,

      generate,

      submit,

      clearError,
    };
  };
