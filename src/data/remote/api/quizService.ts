import {
  MaterialQuiz,
  MaterialQuizQuestion,
  QuizAnswerResult,
  QuizAnswerSubmission,
  QuizSourceType,
  QuizSubmissionResult,
} from '../../../domain/models/MaterialQuiz';

import {
  apiRequest,
} from './apiClient';


type QuizQuestionApiResponse = {

  id:
    number;

  position:
    number;

  question:
    string;

  options:
    string[];
};


type MaterialQuizApiResponse = {

  quiz_id:
    number;

  material_id:
    number;

  title:
    string;

  source_type:
    QuizSourceType;

  provider:
    string;

  question_count:
    number;

  questions:
    QuizQuestionApiResponse[];
};


type QuizAnswerResultApiResponse = {

  question_id:
    number;

  position:
    number;

  question:
    string;

  options:
    string[];

  selected_index:
    number | null;

  correct_index:
    number;

  is_correct:
    boolean;

  explanation:
    string;
};


type QuizSubmissionApiResponse = {

  attempt_id:
    number;

  quiz_id:
    number;

  score:
    number;

  total_questions:
    number;

  percentage:
    number;

  answers:
    QuizAnswerResultApiResponse[];
};


// ============================================================
// QUESTION MAPPER
// ============================================================


const mapQuestion =
  (
    response:
      QuizQuestionApiResponse,
  ): MaterialQuizQuestion => {

    return {

      id:
        String(
          response.id,
        ),

      position:
        response.position,

      question:
        response.question,

      options:
        response.options,
    };
  };


// ============================================================
// QUIZ MAPPER
// ============================================================


const mapQuiz =
  (
    response:
      MaterialQuizApiResponse,
  ): MaterialQuiz => {

    return {

      quizId:
        String(
          response.quiz_id,
        ),

      materialId:
        String(
          response.material_id,
        ),

      title:
        response.title,

      sourceType:
        response.source_type,

      provider:
        response.provider,

      questionCount:
        response.question_count,

      questions:
        response.questions.map(
          mapQuestion,
        ),
    };
  };


// ============================================================
// RESULT ITEM MAPPER
// ============================================================


const mapResultAnswer =
  (
    response:
      QuizAnswerResultApiResponse,
  ): QuizAnswerResult => {

    return {

      questionId:
        String(
          response.question_id,
        ),

      position:
        response.position,

      question:
        response.question,

      options:
        response.options,

      selectedIndex:
        response.selected_index,

      correctIndex:
        response.correct_index,

      isCorrect:
        response.is_correct,

      explanation:
        response.explanation,
    };
  };


// ============================================================
// RESULT MAPPER
// ============================================================


const mapSubmissionResult =
  (
    response:
      QuizSubmissionApiResponse,
  ): QuizSubmissionResult => {

    return {

      attemptId:
        String(
          response.attempt_id,
        ),

      quizId:
        String(
          response.quiz_id,
        ),

      score:
        response.score,

      totalQuestions:
        response.total_questions,

      percentage:
        response.percentage,

      answers:
        response.answers.map(
          mapResultAnswer,
        ),
    };
  };


// ============================================================
// CHECK MISSING QUIZ
// ============================================================


const isMissingQuizError =
  (
    error:
      unknown,
  ): boolean => {

    if (
      !(
        error
        instanceof Error
      )
    ) {

      return false;
    }


    const message =
      error.message
        .toLowerCase();


    return (
      message.includes(
        'no saved quiz exists'
      )
      ||
      message.includes(
        'no saved quiz'
      )
    );
  };


// ============================================================
// GET LATEST QUIZ
// ============================================================


export const getLatestMaterialQuiz =
  async (
    materialId:
      string | number,
  ): Promise<
    MaterialQuiz | null
  > => {

    try {

      const response =
        await apiRequest<
          MaterialQuizApiResponse
        >(
          `/ai/materials/${materialId}/quiz`,
          {
            method:
              'GET',

            authenticated:
              true,
          },
        );


      return (
        mapQuiz(
          response,
        )
      );


    } catch (
      error
    ) {

      if (
        isMissingQuizError(
          error,
        )
      ) {

        return null;
      }


      throw error;
    }
  };


// ============================================================
// GENERATE NEW QUIZ
// ============================================================


export const generateMaterialQuiz =
  async (
    materialId:
      string | number,

    count:
      number = 10,
  ): Promise<
    MaterialQuiz
  > => {

    const response =
      await apiRequest<
        MaterialQuizApiResponse
      >(
        `/ai/materials/${materialId}/quiz?count=${count}`,
        {
          method:
            'POST',

          authenticated:
            true,
        },
      );


    return (
      mapQuiz(
        response,
      )
    );
  };


// ============================================================
// SUBMIT QUIZ
// ============================================================


export const submitMaterialQuiz =
   async (
     quizId:
       string | number,

     answers:
       QuizAnswerSubmission[],
   ): Promise<
     QuizSubmissionResult
   > => {

     const response =
       await apiRequest<
         QuizSubmissionApiResponse
       >(
         `/ai/quizzes/${quizId}/submit`,
         {
           method:
             'POST',

           authenticated:
             true,

           body:
             JSON.stringify({
               answers:
                 answers.map(
                   answer => ({
                     question_id:
                       Number(
                         answer.questionId,
                       ),

                     selected_index:
                       answer.selectedIndex,
                   }),
                 ),
             }),
         },
       );


     return (
       mapSubmissionResult(
         response,
       )
     );
   };