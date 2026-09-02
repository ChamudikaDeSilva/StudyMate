export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  noteId: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: number;
}