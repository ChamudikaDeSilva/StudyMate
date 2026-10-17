import { Material } from '../../../domain/models/Material';
import {
  MaterialCreatePayload,
  MaterialFileCreatePayload,
  MaterialUpdatePayload,
  PendingSyncOperation,
} from './pendingSyncQueue';

interface MaterialRefresh {
  userId: string;
  subjectId: string;
  remote: Material[];
  cachedBefore: Material[];
  cachedNow: Material[];
  operationsBefore: PendingSyncOperation[];
  operationsNow: PendingSyncOperation[];
}

/** Overlay local work on a server response that may predate an edit or replay. */
export const reconcileMaterials = ({
  userId,
  subjectId,
  remote,
  cachedBefore,
  cachedNow,
  operationsBefore,
  operationsNow,
}: MaterialRefresh): Material[] => {
  const result = new Map(remote.map(material => [material.id, material]));
  const before = new Map(cachedBefore.map(material => [material.id, material]));
  const current = new Map(cachedNow.map(material => [material.id, material]));
  const relevant = (operation: PendingSyncOperation) =>
    operation.userId === userId &&
    operation.entity === 'material' &&
    'subjectId' in operation.payload &&
    operation.payload.subjectId === subjectId;

  // Cache changes made during the request include completed sync operations.
  // Preserve them even when their queue entries have already been removed.
  for (const id of before.keys()) {
    if (!current.has(id)) {
      result.delete(id);
    }
  }
  for (const material of cachedNow) {
    if (JSON.stringify(before.get(material.id)) !== JSON.stringify(material)) {
      result.set(material.id, material);
    }
  }
  const pendingIds = new Set(operationsNow.map(operation => operation.id));
  for (const operation of operationsBefore.filter(relevant)) {
    if (pendingIds.has(operation.id) || !('materialId' in operation.payload)) {
      continue;
    }
    const id = operation.payload.materialId;
    const material = current.get(id);
    if (operation.action === 'delete' || !material) {
      result.delete(id);
    } else {
      result.set(id, material);
    }
  }

  for (const operation of operationsNow.filter(relevant)) {
    if (operation.action === 'create') {
      const payload = operation.payload as MaterialCreatePayload | MaterialFileCreatePayload;
      const cached = current.get(payload.localId);
      result.set(payload.localId, {
        ...(cached ?? {
          id: payload.localId,
          userId,
          subjectId,
          sourceType: 'sourceType' in payload ? payload.sourceType : 'text',
          content: 'content' in payload ? payload.content : undefined,
          fileName: 'fileName' in payload ? payload.fileName : undefined,
          createdAt: operation.createdAt,
        }),
        title: payload.title,
        updatedAt: cached?.updatedAt ?? operation.createdAt,
        syncStatus: 'pending',
      });
    } else if ('materialId' in operation.payload) {
      const id = operation.payload.materialId;
      if (operation.action === 'delete') {
        result.delete(id);
      } else {
        const material = result.get(id) ?? current.get(id);
        if (material) {
          const payload = operation.payload as MaterialUpdatePayload;
          result.set(id, {
            ...material,
            title: payload.title,
            ...(payload.kind === 'title' ? {} : { content: payload.content }),
            updatedAt: current.get(id)?.updatedAt ?? operation.createdAt,
            syncStatus: 'pending',
          });
        }
      }
    }
  }
  return [...result.values()];
};
