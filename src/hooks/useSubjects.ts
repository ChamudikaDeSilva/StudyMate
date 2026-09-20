import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {Subject} from '../domain/models/Subject';
import {SubjectRepositoryImpl} from '../data/repositories/SubjectRepositoryImpl';
import {useAuth} from './useAuth';

export const useSubjects = () => {
  const {user} = useAuth();

  const repository = useMemo(
    () => new SubjectRepositoryImpl(),
    [],
  );

  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [
    updatingSubjectId,
    setUpdatingSubjectId,
  ] = useState<string | null>(null);

  const [
    deletingSubjectId,
    setDeletingSubjectId,
  ] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // Load subjects
  // =========================================================

  const loadSubjects = useCallback(async () => {
    if (!user) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result =
        await repository.getSubjects(user.uid);

      setSubjects(result);
    } catch (err) {
      console.error(
        'Failed to load subjects:',
        err,
      );

      setError('Unable to load subjects.');
    } finally {
      setLoading(false);
    }
  }, [repository, user]);

  // =========================================================
  // Create subject
  // =========================================================

  const createSubject = async (
    name: string,
    description?: string,
  ) => {
    if (!user) {
      throw new Error(
        'User is not authenticated.',
      );
    }

    const trimmedName = name.trim();
    const trimmedDescription =
      description?.trim();

    if (!trimmedName) {
      throw new Error(
        'Subject name is required.',
      );
    }

    try {
      setCreating(true);
      setError(null);

      const newSubject =
        await repository.createSubject({
          userId: user.uid,
          name: trimmedName,
          description:
            trimmedDescription || undefined,
        });

      setSubjects(currentSubjects => [
        newSubject,
        ...currentSubjects,
      ]);

      return newSubject;
    } catch (err) {
      console.error(
        'Failed to create subject:',
        err,
      );

      setError(
        'Unable to create subject.',
      );

      throw err;
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // Update subject
  // =========================================================

  const updateSubject = async (
    subjectId: string,
    name: string,
    description?: string,
  ) => {
    if (!user) {
      throw new Error(
        'User is not authenticated.',
      );
    }

    const trimmedName = name.trim();
    const trimmedDescription =
      description?.trim();

    if (!trimmedName) {
      throw new Error(
        'Subject name is required.',
      );
    }

    try {
      setUpdatingSubjectId(subjectId);
      setError(null);

      await repository.updateSubject(
        subjectId,
        {
          name: trimmedName,
          description:
            trimmedDescription || undefined,
        },
      );

      const updatedAt = Date.now();

      /*
       * Update local state after Firestore succeeds.
       *
       * This avoids loading the whole subjects
       * collection again just because one subject
       * was edited.
       */
      setSubjects(currentSubjects =>
        currentSubjects.map(subject =>
          subject.id === subjectId
            ? {
                ...subject,
                name: trimmedName,
                description:
                  trimmedDescription || '',
                updatedAt,
                syncStatus: 'synced',
              }
            : subject,
        ),
      );
    } catch (err) {
      console.error(
        'Failed to update subject:',
        err,
      );

      setError(
        'Unable to update subject.',
      );

      throw err;
    } finally {
      setUpdatingSubjectId(null);
    }
  };

  // =========================================================
  // Delete subject
  // =========================================================

  const deleteSubject = async (
    subjectId: string,
  ) => {
    if (!user) {
      throw new Error(
        'User is not authenticated.',
      );
    }

    try {
      setDeletingSubjectId(subjectId);
      setError(null);

      await repository.deleteSubject(
        subjectId,
      );

      /*
       * Firestore delete succeeded, so remove
       * the subject from the local state as well.
       */
      setSubjects(currentSubjects =>
        currentSubjects.filter(
          subject =>
            subject.id !== subjectId,
        ),
      );
    } catch (err) {
      console.error(
        'Failed to delete subject:',
        err,
      );

      setError(
        'Unable to delete subject.',
      );

      throw err;
    } finally {
      setDeletingSubjectId(null);
    }
  };

  // =========================================================
  // Initial load
  // =========================================================

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  return {
    subjects,

    loading,
    creating,

    updatingSubjectId,
    deletingSubjectId,

    error,

    loadSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  };
};