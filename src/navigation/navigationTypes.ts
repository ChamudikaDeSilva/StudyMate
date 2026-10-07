import type {
  QuizSubmissionResult,
} from '../domain/models/MaterialQuiz';


// ============================================================
// AUTH STACK
// ============================================================

export type AuthStackParamList = {

  Login:
    undefined;

  Register:
    undefined;
};


// ============================================================
// MAIN BOTTOM TAB NAVIGATION
// ============================================================

export type MainTabParamList = {

  Home:
    undefined;

  Subjects:
    undefined;

  Quiz:
    undefined;

  Profile:
    undefined;
};


// ============================================================
// SUBJECTS STACK
// ============================================================

export type SubjectsStackParamList = {

  // =========================================================
  // SUBJECTS HOME
  // =========================================================

  SubjectsHome:
    undefined;


  // =========================================================
  // SUBJECT MATERIALS
  // =========================================================

  SubjectMaterials: {

    subjectId:
      string;

    subjectName:
      string;
  };


  // =========================================================
  // ADD MATERIAL
  // =========================================================

  AddMaterial: {

    subjectId:
      string;

    subjectName:
      string;
  };


  // =========================================================
  // MATERIAL DETAILS
  // =========================================================

  MaterialDetails: {

    materialId:
      string;

    subjectId:
      string;

    subjectName:
      string;
  };


  // =========================================================
  // PDF PREVIEW
  // =========================================================

  PdfPreview: {

    materialId:
      string;

    subjectId:
      string;

    subjectName:
      string;

    title:
      string;
  };


  // =========================================================
  // IMAGE PREVIEW
  // =========================================================

  ImagePreview: {

    materialId:
      string;

    subjectId:
      string;

    subjectName:
      string;

    title:
      string;
  };


  // =========================================================
  // AI SUMMARY
  // =========================================================

  MaterialSummary: {

    materialId:
      string;

    subjectId:
      string;

    subjectName:
      string;

    materialTitle:
      string;
  };


  // =========================================================
  // AI FLASHCARDS
  // =========================================================

  MaterialFlashcards: {

    materialId:
      string;

    subjectId:
      string;

    subjectName:
      string;

    materialTitle:
      string;
  };


  // =========================================================
  // AI QUIZ
  //
  // forceGenerate is used when:
  //
  // Result Screen
  //      ↓
  // Try New Quiz
  //      ↓
  // Generate a NEW quiz instead of loading latest.
  // =========================================================

  MaterialQuiz: {

    materialId:
      string;

    subjectId:
      string;

    subjectName:
      string;

    materialTitle:
      string;

    forceGenerate?:
      boolean;
  };


  // =========================================================
  // QUIZ RESULT
  // =========================================================

  MaterialQuizResult: {

    materialId:
      string;

    subjectId:
      string;

    subjectName:
      string;

    materialTitle:
      string;

    result:
      QuizSubmissionResult;
  };
};