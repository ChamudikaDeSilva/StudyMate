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
  createLocalEntityId,
  enqueueSyncOperation,
  isLocalEntityId,
  removeLocalEntityOperations,
} from '../data/local/sync/pendingSyncQueue';

import {
  useAuth,
} from './useAuth';

import {
  useNetwork,
} from './useNetwork';


export const useSubjects = () => {

  const {
    user,
  } = useAuth();


  const {
    isOnline,
    initialized: networkInitialized,
  } = useNetwork();


  // =========================================================
  // REPOSITORY
  // =========================================================

  const repository =
    useMemo(
      () =>
        new SubjectApiRepositoryImpl(),
      [],
    );


  // =========================================================
  // STATE
  // =========================================================

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
  // LOAD SUBJECTS
  // =========================================================

  const loadSubjects =
    useCallback(
      async () => {

        if (!userId) {

          setSubjects(
            [],
          );

          setLoading(
            false,
          );

          return;
        }


        try {

          setLoading(
            true,
          );

          setError(
            null,
          );


          // ===================================================
          // LOCAL CACHE FIRST
          // ===================================================

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


          // ===================================================
          // NETWORK STATUS NOT READY
          // ===================================================

          if (
            !networkInitialized
          ) {

            return;
          }


          // ===================================================
          // OFFLINE
          // ===================================================

          if (
            !isOnline
          ) {

            setSubjects(
              cachedSubjects,
            );

            return;
          }


          // ===================================================
          // ONLINE
          // ===================================================

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

          } catch (
            remoteError
          ) {

            console.warn(
              'Load subjects API error:',
              remoteError,
            );


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

        } catch (
          loadError
        ) {

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

          setLoading(
            false,
          );
        }
      },
      [
        repository,
        userId,
        networkInitialized,
        isOnline,
      ],
    );


  useEffect(
    () => {

      void loadSubjects();

    },
    [
      loadSubjects,
    ],
  );


  // =========================================================
  // CREATE SUBJECT
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

          setCreating(
            true,
          );

          setError(
            null,
          );


          // ===================================================
          // OFFLINE CREATE
          // ===================================================

          if (
            networkInitialized
            &&
            !isOnline
          ) {

            const localId =
              createLocalEntityId(
                'subject',
              );


            const now =
              Date.now();


            const localSubject:
              Subject = {

                id:
                  localId,

                userId,

                name,

                description,

                createdAt:
                  now,

                updatedAt:
                  now,

                syncStatus:
                  'pending',
              };


            // -----------------------------------------------
            // Queue first
            // -----------------------------------------------

            await enqueueSyncOperation(
              userId,
              {
                entity:
                  'subject',

                action:
                  'create',

                payload: {
                  localId,

                  name,

                  description,
                },
              },
            );


            // -----------------------------------------------
            // Update local UI + cache
            // -----------------------------------------------

            setSubjects(
              current => {

                const next = [
                  localSubject,
                  ...current,
                ];


                void saveSubjectsCache(
                  userId,
                  next,
                );


                return next;
              },
            );


            console.log(
              '[OFFLINE SUBJECT] Created locally',
              {
                localId,
                name,
              },
            );


            return localSubject;
          }


          // ===================================================
          // ONLINE CREATE
          // ===================================================

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

        } catch (
          createError
        ) {

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

          setCreating(
            false,
          );
        }
      },
      [
        repository,
        userId,
        networkInitialized,
        isOnline,
      ],
    );


  // =========================================================
  // UPDATE SUBJECT
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


          setError(
            null,
          );


          /*
           * Queue the update when:
           *
           * 1. Device is offline
           *
           * OR
           *
           * 2. Subject still has a temporary
           *    local ID and has not reached
           *    FastAPI yet.
           */

          const shouldQueue =
            (
              networkInitialized
              &&
              !isOnline
            )
            ||
            isLocalEntityId(
              subjectId,
            );


          // ===================================================
          // OFFLINE / LOCAL UPDATE
          // ===================================================

          if (
            shouldQueue
          ) {

            await enqueueSyncOperation(
              userId,
              {
                entity:
                  'subject',

                action:
                  'update',

                payload: {
                  subjectId,

                  name,

                  description,
                },
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
                              'pending' as const,
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


            console.log(
              '[OFFLINE SUBJECT] Update queued',
              {
                subjectId,
              },
            );


            return;
          }


          // ===================================================
          // ONLINE UPDATE
          // ===================================================

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

        } catch (
          updateError
        ) {

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
        networkInitialized,
        isOnline,
      ],
    );


  // =========================================================
  // DELETE SUBJECT
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


          setError(
            null,
          );


          // ===================================================
          // LOCAL-ONLY SUBJECT
          // ===================================================
          //
          // Created offline and deleted before
          // ever reaching FastAPI.
          //
          // No server operation is required.
          //

          if (
            isLocalEntityId(
              subjectId,
            )
          ) {

            await removeLocalEntityOperations(
              userId,
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


            await removeMaterialsCache(
              userId,
              subjectId,
            );


            console.log(
              '[OFFLINE SUBJECT] Local subject removed',
              {
                subjectId,
              },
            );


            return;
          }


          // ===================================================
          // OFFLINE DELETE
          // ===================================================

          if (
            networkInitialized
            &&
            !isOnline
          ) {

            await enqueueSyncOperation(
              userId,
              {
                entity:
                  'subject',

                action:
                  'delete',

                payload: {
                  subjectId,
                },
              },
            );


            /*
             * Remove from the local UI
             * immediately.
             */

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


            await removeMaterialsCache(
              userId,
              subjectId,
            );


            console.log(
              '[OFFLINE SUBJECT] Delete queued',
              {
                subjectId,
              },
            );


            return;
          }


          // ===================================================
          // ONLINE DELETE
          // ===================================================

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


          await removeMaterialsCache(
            userId,
            subjectId,
          );

        } catch (
          deleteError
        ) {

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
        networkInitialized,
        isOnline,
      ],
    );


  // =========================================================
  // RETURN
  // =========================================================

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