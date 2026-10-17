import {Subject} from '../../../domain/models/Subject';
import {
  PendingSyncOperation,
  SubjectCreatePayload,
  SubjectUpdatePayload,
} from './pendingSyncQueue';

interface SubjectRefresh {
  userId: string;
  remote: Subject[];
  cachedBefore: Subject[];
  cachedNow: Subject[];
  operationsBefore: PendingSyncOperation[];
  operationsNow: PendingSyncOperation[];
}

/** Preserve local subject mutations when a server refresh finishes later. */
export const reconcileSubjects = ({
  userId,
  remote,
  cachedBefore,
  cachedNow,
  operationsBefore,
  operationsNow,
}: SubjectRefresh): Subject[] => {
  const owned = (subject: Subject) => subject.userId === userId;
  const result = new Map(remote.filter(owned).map(subject => [subject.id, subject]));
  const before = new Map(cachedBefore.filter(owned).map(subject => [subject.id, subject]));
  const current = new Map(cachedNow.filter(owned).map(subject => [subject.id, subject]));
  const relevant = (operation: PendingSyncOperation) =>
    operation.userId === userId && operation.entity === 'subject';

  // A replay may have already removed its queue entry while this GET was in flight.
  for (const id of before.keys()) {
    if (!current.has(id)) {
      result.delete(id);
    }
  }
  for (const subject of current.values()) {
    if (JSON.stringify(before.get(subject.id)) !== JSON.stringify(subject)) {
      result.set(subject.id, subject);
    }
  }

  const pendingIds = new Set(operationsNow.filter(relevant).map(operation => operation.id));
  for (const operation of operationsBefore.filter(relevant)) {
    if (pendingIds.has(operation.id) || !('subjectId' in operation.payload)) {
      continue;
    }
    const id = operation.payload.subjectId;
    const subject = current.get(id);
    if (operation.action === 'delete' || !subject) {
      result.delete(id);
    } else {
      result.set(id, subject);
    }
  }

  for (const operation of operationsNow.filter(relevant)) {
    if (operation.action === 'create') {
      const payload = operation.payload as SubjectCreatePayload;
      const cached = current.get(payload.localId);
      result.set(payload.localId, {
        ...(cached ?? {
          id: payload.localId,
          userId,
          createdAt: operation.createdAt,
        }),
        name: payload.name,
        description: payload.description,
        updatedAt: cached?.updatedAt ?? operation.createdAt,
        syncStatus: 'pending',
      });
    } else if ('subjectId' in operation.payload) {
      const id = operation.payload.subjectId;
      if (operation.action === 'delete') {
        result.delete(id);
      } else {
        const subject = result.get(id) ?? current.get(id);
        if (subject) {
          const payload = operation.payload as SubjectUpdatePayload;
          result.set(id, {
            ...subject,
            name: payload.name,
            description: payload.description,
            updatedAt: current.get(id)?.updatedAt ?? operation.createdAt,
            syncStatus: 'pending',
          });
        }
      }
    }
  }
  return [...result.values()];
};
