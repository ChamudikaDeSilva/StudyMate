// "note" is kept temporarily for backward compatibility with old queued data.
// New material-related sync work should use "material".
export type SyncEntityType = 'subject' | 'material' | 'note' | 'quizResult';
export type SyncOperation = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  createdAt: number;
  retryCount: number;
}
