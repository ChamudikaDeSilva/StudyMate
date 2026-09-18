import {useCallback, useEffect, useMemo, useState} from 'react';

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
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = useCallback(async () => {
    if (!user) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await repository.getSubjects(user.uid);

      setSubjects(result);
    } catch (err) {
      console.error('Failed to load subjects:', err);

      setError('Unable to load subjects.');
    } finally {
      setLoading(false);
    }
  }, [repository, user]);

  const createSubject = async (
    name: string,
    description?: string,
  ) => {
    if (!user) {
      throw new Error('User is not authenticated.');
    }

    if (!name.trim()) {
      throw new Error('Subject name is required.');
    }

    try {
      setCreating(true);
      setError(null);

      const newSubject = await repository.createSubject({
        userId: user.uid,
        name,
        description,
      });

      setSubjects(currentSubjects => [
        newSubject,
        ...currentSubjects,
      ]);

      return newSubject;
    } catch (err) {
      console.error('Failed to create subject:', err);

      setError('Unable to create subject.');

      throw err;
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  return {
    subjects,
    loading,
    creating,
    error,
    loadSubjects,
    createSubject,
  };
};