import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Subject } from '../domain/models/Subject';
import { SubjectApiRepositoryImpl } from '../data/repositories/SubjectApiRepositoryImpl';
import {
  getSubjectsCache,
  removeMaterialsCache,
  updateSubjectsCache,
} from '../data/local/storage/offlineCache';
import {
  createLocalEntityId,
  enqueueSyncOperation,
  getPendingSyncOperations,
  isLocalEntityId,
  removeLocalEntityOperations,
} from '../data/local/sync/pendingSyncQueue';
import { reconcileSubjects } from '../data/local/sync/reconcileSubjects';
import { useAuth } from './useAuth';
import { useNetwork } from './useNetwork';

export const useSubjects = () => {
  const { user } = useAuth();
  const { isOnline, initialized: networkInitialized } = useNetwork();
  const repository = useMemo(() => new SubjectApiRepositoryImpl(), []);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingSubjectId, setUpdatingSubjectId] = useState<string | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const userId = user ? String(user.id) : null;
  const currentUser = useRef(userId);
  const mounted = useRef(true);
  const latestLoad = useRef(0);
  currentUser.current = userId;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      latestLoad.current += 1;
    };
  }, []);

  const commitSubjects = useCallback(async (
    update: (current: Subject[]) => Subject[] | Promise<Subject[]>,
  ) => {
    if (!userId) {
      return;
    }
    const next = await updateSubjectsCache(userId, update);
    if (mounted.current && currentUser.current === userId) {
      setSubjects(next);
    }
  }, [userId]);

  const loadSubjects = useCallback(async () => {
    const request = ++latestLoad.current;
    const isCurrent = () => mounted.current &&
      currentUser.current === userId && latestLoad.current === request;
    if (!userId) {
      setSubjects([]);
      setLoading(false);
      return;
    }
    setError(null);
    let cachedBefore: Subject[] = [];
    try {
      cachedBefore = await getSubjectsCache(userId);
      if (!isCurrent()) {
        return;
      }
      setSubjects(cachedBefore);
      // A background focus refresh should not replace cached rows with a spinner.
      setLoading(cachedBefore.length === 0 && isOnline && networkInitialized);
      if (!networkInitialized || !isOnline) {
        return;
      }
      const operationsBefore = await getPendingSyncOperations(userId);
      const remote = await repository.getSubjects(userId);
      if (!isCurrent()) {
        return;
      }
      const next = await updateSubjectsCache(userId, async cachedNow => {
        if (!isCurrent()) {
          return cachedNow;
        }
        const operationsNow = await getPendingSyncOperations(userId);
        return reconcileSubjects({
          userId, remote, cachedBefore, cachedNow,
          operationsBefore, operationsNow,
        });
      });
      if (isCurrent()) {
        setSubjects(next);
      }
    } catch (loadError) {
      if (!isCurrent()) {
        return;
      }
      // Read again: an offline edit or completed replay may have changed the
      // shared cache while the request was in flight.
      const cachedNow = await getSubjectsCache(userId);
      if (!isCurrent()) {
        return;
      }
      setSubjects(cachedNow);
      if (cachedNow.length === 0) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load subjects.');
      }
    } finally {
      if (isCurrent()) {
        setLoading(false);
      }
    }
  }, [repository, userId, networkInitialized, isOnline]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const hasPendingSubject = useCallback(async (subjectId: string) => {
    if (!userId) {
      return false;
    }
    const pending = await getPendingSyncOperations(userId);
    return pending.some(operation => operation.entity === 'subject' && (
      ('subjectId' in operation.payload && operation.payload.subjectId === subjectId) ||
      ('localId' in operation.payload && operation.payload.localId === subjectId)
    ));
  }, [userId]);

  const createSubject = useCallback(async (
    name: string, description?: string,
  ): Promise<Subject> => {
    if (!userId) {
      throw new Error('You must be logged in.');
    }
    setCreating(true);
    setError(null);
    try {
      if (!networkInitialized || !isOnline) {
        const localId = createLocalEntityId('subject');
        const now = Date.now();
        const created: Subject = {
          id: localId, userId, name, description,
          createdAt: now, updatedAt: now, syncStatus: 'pending',
        };
        await commitSubjects(async current => {
          await enqueueSyncOperation(userId, {
            entity: 'subject', action: 'create',
            payload: { localId, name, description },
          });
          return [created, ...current];
        });
        return created;
      }
      const created = await repository.createSubject({ userId, name, description });
      await commitSubjects(current => [created, ...current.filter(item => item.id !== created.id)]);
      return created;
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create subject.');
      throw createError;
    } finally {
      setCreating(false);
    }
  }, [userId, networkInitialized, isOnline, commitSubjects, repository]);

  const updateSubject = useCallback(async (
    subjectId: string, name: string, description?: string,
  ): Promise<void> => {
    if (!userId) {
      throw new Error('You must be logged in.');
    }
    setUpdatingSubjectId(subjectId);
    setError(null);
    try {
      const shouldQueue = !networkInitialized || !isOnline ||
        isLocalEntityId(subjectId) || await hasPendingSubject(subjectId);
      if (!shouldQueue) {
        await repository.updateSubject(subjectId, { name, description });
      }
      await commitSubjects(async current => {
        if (shouldQueue) {
          await enqueueSyncOperation(userId, {
            entity: 'subject', action: 'update',
            payload: { subjectId, name, description },
          });
        }
        return current.map(subject => subject.id === subjectId ? {
          ...subject, name, description, updatedAt: Date.now(),
          syncStatus: shouldQueue ? 'pending' : 'synced',
        } : subject);
      });
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update subject.');
      throw updateError;
    } finally {
      setUpdatingSubjectId(null);
    }
  }, [userId, networkInitialized, isOnline, hasPendingSubject, commitSubjects, repository]);

  const deleteSubject = useCallback(async (subjectId: string): Promise<void> => {
    if (!userId) {
      throw new Error('You must be logged in.');
    }
    setDeletingSubjectId(subjectId);
    setError(null);
    try {
      if (isLocalEntityId(subjectId)) {
        let removed: Subject | undefined;
        await commitSubjects(current => {
          removed = current.find(subject => subject.id === subjectId);
          return current.filter(subject => subject.id !== subjectId);
        });
        try {
          await removeLocalEntityOperations(userId, subjectId);
        } catch (queueError) {
          if (removed) {
            const restore = removed;
            await commitSubjects(current => [restore, ...current.filter(subject => subject.id !== subjectId)]);
          }
          throw queueError;
        }
      } else {
        const shouldQueue = !networkInitialized || !isOnline || await hasPendingSubject(subjectId);
        if (!shouldQueue) {
          await repository.deleteSubject(subjectId);
        }
        await commitSubjects(async current => {
          if (shouldQueue) {
            await enqueueSyncOperation(userId, {
              entity: 'subject', action: 'delete', payload: { subjectId },
            });
          }
          return current.filter(subject => subject.id !== subjectId);
        });
      }
      await removeMaterialsCache(userId, subjectId);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete subject.');
      throw deleteError;
    } finally {
      setDeletingSubjectId(null);
    }
  }, [userId, networkInitialized, isOnline, hasPendingSubject, commitSubjects, repository]);

  return {
    subjects, loading, creating, updatingSubjectId, deletingSubjectId,
    error, loadSubjects, createSubject, updateSubject, deleteSubject,
  };
};
