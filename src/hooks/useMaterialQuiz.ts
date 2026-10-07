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


export const useMaterialQuiz =
  () => {

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
    // LOAD LATEST
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
          resolveErrorMessage,
        ],
      );


    // ========================================================
    // GENERATE
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
          resolveErrorMessage,
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


    return {

      quiz,

      result,

      loading,

      generating,

      submitting,

      error,

      loadLatest,

      generate,

      submit,
    };
  };