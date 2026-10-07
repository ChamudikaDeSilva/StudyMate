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
  getSubjectsCache,
  removeMaterialsCache,
  saveSubjectsCache,
} from '../data/local/storage/offlineCache';

import {
  useAuth,
} from './useAuth';

import {
  useNetwork,
} from './useNetwork';


export const useSubjects = () => {
  const {user} = useAuth();

  const {
    isOnline,
    initialized: networkInitialized,
  } = useNetwork();


  /*
   * FastAPI repository.
   *
   * Do not use the old
   * Firestore repository.
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
  // Online requirement
  // =========================================================

  const requireOnline =
    useCallback(() => {
      if (
        networkInitialized &&
        !isOnline
      ) {
        throw new Error(
          'This action requires an internet connection.',
        );
      }
    }, [
      networkInitialized,
      isOnline,
    ]);


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


          /*
           * Read local data first.
           *
           * This allows previously loaded
           * subjects to remain available
           * without internet.
           */
          const cachedSubjects =
            await getSubjectsCache(
              userId,
            );


          if (
            cachedSubjects.length > 0
          ) {
            setSubjects(
              cachedSubjects,
            );
          }


          /*
           * NetInfo has not determined
           * connectivity yet.
           *
           * The hook will run again when
           * networkInitialized changes.
           */
          if (!networkInitialized) {
            return;
          }


          /*
           * Offline:
           *
           * Do not attempt FastAPI.
           * Keep/show cached subjects.
           */
          if (!isOnline) {
            setSubjects(
              cachedSubjects,
            );

            return;
          }


          /*
           * Online:
           *
           * Get fresh data from FastAPI,
           * then update the local cache.
           */
          try {
            const result =
              await repository
                .getSubjects(
                  userId,
                );


            setSubjects(
              result,
            );


            await saveSubjectsCache(
              userId,
              result,
            );

          } catch (remoteError) {
            console.warn(
              'Load subjects API error:',
              remoteError,
            );


            /*
             * If FastAPI is unavailable,
             * continue using cached data.
             */
            if (
              cachedSubjects.length > 0
            ) {
              setSubjects(
                cachedSubjects,
              );

              return;
            }


            const message =
              remoteError instanceof Error
                ? remoteError.message
                : 'Unable to load subjects.';


            setError(
              message,
            );
          }

        } catch (loadError) {
          console.warn(
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
        networkInitialized,
        isOnline,
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


        requireOnline();


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
            current => {
              const next = [
                createdSubject,
                ...current,
              ];


              void saveSubjectsCache(
                userId,
                next,
              );


              return next;
            },
          );


          return createdSubject;

        } catch (createError) {
          console.warn(
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
        requireOnline,
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


        requireOnline();


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
            current => {
              const next:
                Subject[] =
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
                            'synced' as const,
                        }
                      : subject,
                );


              void saveSubjectsCache(
                userId,
                next,
              );


              return next;
            },
          );

        } catch (updateError) {
          console.warn(
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
        requireOnline,
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


        requireOnline();


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
            current => {
              const next =
                current.filter(
                  subject =>
                    subject.id !==
                    subjectId,
                );


              void saveSubjectsCache(
                userId,
                next,
              );


              return next;
            },
          );


          /*
           * The subject was deleted,
           * so its local material cache
           * is no longer required.
           */
          await removeMaterialsCache(
            userId,
            subjectId,
          );

        } catch (deleteError) {
          console.warn(
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
        requireOnline,
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