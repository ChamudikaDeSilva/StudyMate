export type SyncEntityType =
  | 'subject'
  | 'note'
  | 'quizResult';

export type SyncOperation =
  | 'create'
  | 'update'
  | 'delete';

export interface SyncQueueItem {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  createdAt: number;
  retryCount: number;
}