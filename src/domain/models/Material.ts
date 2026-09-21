export type MaterialSourceType =
  | 'text'
  | 'pdf'
  | 'image'
  | 'camera';

export type MaterialSyncStatus =
  | 'synced'
  | 'pending'
  | 'syncing'
  | 'failed';

export interface Material {
  id: string;

  userId: string;
  subjectId: string;

  title: string;

  sourceType: MaterialSourceType;

  /*
   * Used for text materials.
   * Later this can also contain extracted text
   * from PDF/image/camera sources.
   */
  content?: string;

  /*
   * Used by PDF/image/camera materials later.
   */
  fileName?: string;
  fileUrl?: string;

  createdAt: number;
  updatedAt: number;

  syncStatus: MaterialSyncStatus;
}