import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Subject,
} from '../domain/models/Subject';

import {
  SubjectApiRepositoryImpl,
} from '../data/repositories/SubjectApiRepositoryImpl';

import {
  useAuth,
} from './useAuth';


export const useSubjects = () => {
  const {user} = useAuth();


  /*
   * IMPORTANT:
   *
   * We are now using FastAPI.
   *
   * Do NOT import:
   *
   * SubjectRepositoryImpl
   *
   * because that is the old
   * Firestore implementation.
   */
  const repository =
    useMemo(
      () =>
        new SubjectApiRepositoryImpl(),
      [],
    );


  const [
    subjects,
    setSubjects,
  ] = useState<Subject[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    creating,
    setCreating,
  ] = useState(false);


  const [
    updatingSubjectId,
    setUpdatingSubjectId,
  ] = useState<string | null>(
    null,
  );


  const [
    deletingSubjectId,
    setDeletingSubjectId,
  ] = useState<string | null>(
    null,
  );


  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  const userId =
    user
      ? String(user.id)
      : null;


  // =========================================================
  // Load
  // =========================================================

  const loadSubjects =
    useCallback(
      async () => {
        if (!userId) {
          setSubjects([]);
          setLoading(false);

          return;
        }


        try {
          setLoading(true);
          setError(null);


          const result =
            await repository
              .getSubjects(
                userId,
              );


          setSubjects(
            result,
          );

        } catch (loadError) {
          console.error(
            'Load subjects error:',
            loadError,
          );


          const message =
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load subjects.';


          setError(
            message,
          );

        } finally {
          setLoading(false);
        }
      },
      [
        repository,
        userId,
      ],
    );


  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);


  // =========================================================
  // Create
  // =========================================================

  const createSubject =
    useCallback(
      async (
        name: string,
        description?: string,
      ): Promise<Subject> => {

        if (!userId) {
          throw new Error(
            'You must be logged in.',
          );
        }


        try {
          setCreating(true);
          setError(null);


          const createdSubject =
            await repository
              .createSubject({
                userId,
                name,
                description,
              });


          setSubjects(
            current => [
              createdSubject,
              ...current,
            ],
          );


          return createdSubject;

        } catch (createError) {
          console.error(
            'Create subject error:',
            createError,
          );


          const message =
            createError instanceof Error
              ? createError.message
              : (
                  'Unable to create '
                  + 'subject.'
                );


          setError(
            message,
          );

          throw createError;

        } finally {
          setCreating(false);
        }
      },
      [
        repository,
        userId,
      ],
    );


  // =========================================================
  // Update
  // =========================================================

  const updateSubject =
    useCallback(
      async (
        subjectId: string,
        name: string,
        description?: string,
      ): Promise<void> => {

        if (!userId) {
          throw new Error(
            'You must be logged in.',
          );
        }


        try {
          setUpdatingSubjectId(
            subjectId,
          );

          setError(null);


          await repository
            .updateSubject(
              subjectId,
              {
                name,
                description,
              },
            );


          setSubjects(
            current =>
              current.map(
                subject =>
                  subject.id ===
                  subjectId
                    ? {
                        ...subject,

                        name,

                        description,

                        updatedAt:
                          Date.now(),

                        syncStatus:
                          'synced',
                      }
                    : subject,
              ),
          );

        } catch (updateError) {
          console.error(
            'Update subject error:',
            updateError,
          );


          const message =
            updateError instanceof Error
              ? updateError.message
              : (
                  'Unable to update '
                  + 'subject.'
                );


          setError(
            message,
          );

          throw updateError;

        } finally {
          setUpdatingSubjectId(
            null,
          );
        }
      },
      [
        repository,
        userId,
      ],
    );


  // =========================================================
  // Delete
  // =========================================================

  const deleteSubject =
    useCallback(
      async (
        subjectId: string,
      ): Promise<void> => {

        if (!userId) {
          throw new Error(
            'You must be logged in.',
          );
        }


        try {
          setDeletingSubjectId(
            subjectId,
          );

          setError(null);


          await repository
            .deleteSubject(
              subjectId,
            );


          setSubjects(
            current =>
              current.filter(
                subject =>
                  subject.id !==
                  subjectId,
              ),
          );

        } catch (deleteError) {
          console.error(
            'Delete subject error:',
            deleteError,
          );


          const message =
            deleteError instanceof Error
              ? deleteError.message
              : (
                  'Unable to delete '
                  + 'subject.'
                );


          setError(
            message,
          );

          throw deleteError;

        } finally {
          setDeletingSubjectId(
            null,
          );
        }
      },
      [
        repository,
        userId,
      ],
    );


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