import {SyncStatus} from './SyncStatus';

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: number;
  syncStatus: SyncStatus;
}