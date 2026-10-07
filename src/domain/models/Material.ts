import {SyncStatus} from './SyncStatus';

export type MaterialSourceType = 'text' | 'pdf' | 'image' | 'camera';

// Backward-compatible alias. Prefer the shared SyncStatus type in new code.
export type MaterialSyncStatus = SyncStatus;

export interface Material {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  sourceType: MaterialSourceType;
  content?: string;
  fileName?: string;
  fileUrl?: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}
