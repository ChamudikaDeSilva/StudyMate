import {SyncStatus} from './SyncStatus';

export interface Subject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}