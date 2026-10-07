export type QuizSourceType =
  | 'text'
  | 'pdf'
  | 'image'
  | 'camera';


export interface MaterialQuizQuestion {

  id:
    string;

  position:
    number;

  question:
    string;

  options:
    string[];
}


export interface MaterialQuiz {

  quizId:
    string;

  materialId:
    string;

  title:
    string;

  sourceType:
    QuizSourceType;

  provider:
    string;

  questionCount:
    number;

  questions:
    MaterialQuizQuestion[];
}


export interface QuizAnswerSubmission {

  questionId:
    string;

  selectedIndex:
    number | null;
}


export interface QuizAnswerResult {

  questionId:
    string;

  position:
    number;

  question:
    string;

  options:
    string[];

  selectedIndex:
    number | null;

  correctIndex:
    number;

  isCorrect:
    boolean;

  explanation:
    string;
}


export interface QuizSubmissionResult {

  attemptId:
    string;

  quizId:
    string;

  score:
    number;

  totalQuestions:
    number;

  percentage:
    number;

  answers:
    QuizAnswerResult[];
}