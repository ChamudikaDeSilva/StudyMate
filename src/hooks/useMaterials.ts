import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Material,
} from '../domain/models/Material';

import {
  MaterialApiRepositoryImpl,
} from '../data/repositories/MaterialApiRepositoryImpl';

import {
  getMaterialsCache,
  saveMaterialsCache,
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

import {
  offlineFileStorageService,
} from '../services/offline/OfflineFileStorageService';


export const useMaterials = (
  subjectId: string,
) => {

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
        new MaterialApiRepositoryImpl(),
      [],
    );


  // =========================================================
  // STATE
  // =========================================================

  const [
    materials,
    setMaterials,
  ] = useState<Material[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    creating,
    setCreating,
  ] = useState(false);


  const [
    updatingMaterialId,
    setUpdatingMaterialId,
  ] = useState<string | null>(
    null,
  );


  const [
    deletingMaterialId,
    setDeletingMaterialId,
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
  // ONLINE-ONLY CHECK
  // =========================================================
  //
  // Used only for:
  //
  // Image upload
  // Camera upload
  //
  // Text and PDF materials are allowed offline.
  //

  const requireOnline =
    useCallback(() => {

      if (
        networkInitialized
        &&
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
  // LOAD MATERIALS
  // =========================================================

  const loadMaterials =
    useCallback(
      async () => {

        if (!userId) {

          setMaterials(
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
          // CACHE FIRST
          // ===================================================

          const cachedMaterials =
            await getMaterialsCache(
              userId,
              subjectId,
            );


          if (
            cachedMaterials.length > 0
          ) {

            setMaterials(
              cachedMaterials,
            );
          }


          // ===================================================
          // NETWORK NOT READY
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

            setMaterials(
              cachedMaterials,
            );

            return;
          }


          // ===================================================
          // LOCAL SUBJECT
          // ===================================================
          //
          // A Subject created offline does not
          // exist in FastAPI yet.
          //
          // Therefore we must not request:
          //
          // /subjects/local-subject-.../materials
          //

          if (
            isLocalEntityId(
              subjectId,
            )
          ) {

            setMaterials(
              cachedMaterials,
            );

            return;
          }


          // ===================================================
          // ONLINE
          // ===================================================

          try {

            const result =
              await repository
                .getMaterials(
                  userId,
                  subjectId,
                );


            setMaterials(
              result,
            );


            await saveMaterialsCache(
              userId,
              subjectId,
              result,
            );

          } catch (
            remoteError
          ) {

            console.warn(
              'Load materials API error:',
              remoteError,
            );


            if (
              cachedMaterials.length > 0
            ) {

              setMaterials(
                cachedMaterials,
              );

              return;
            }


            setError(
              remoteError instanceof Error
                ? remoteError.message
                : 'Unable to load materials.',
            );
          }

        } catch (
          loadError
        ) {

          console.warn(
            'Load materials error:',
            loadError,
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load materials.',
          );

        } finally {

          setLoading(
            false,
          );
        }
      },
      [
        repository,
        subjectId,
        userId,
        networkInitialized,
        isOnline,
      ],
    );


  useEffect(
    () => {

      void loadMaterials();

    },
    [
      loadMaterials,
    ],
  );


  // =========================================================
  // ADD MATERIAL TO STATE + CACHE
  // =========================================================

  const addMaterialToState =
    useCallback(
      async (
        material: Material,
      ): Promise<void> => {

        if (!userId) {
          return;
        }


        /*
         * Read the shared cache first.
         *
         * This is important because
         * AddMaterialScreen and
         * SubjectMaterialsScreen each
         * have their own useMaterials()
         * instance.
         */
        const cachedMaterials =
          await getMaterialsCache(
            userId,
            subjectId,
          );


        /*
         * Prevent accidental duplicate
         * entries if this material already
         * exists in the cache.
         */
        const withoutExisting =
          cachedMaterials.filter(
            item =>
              item.id !==
              material.id,
          );


        const next = [
          material,
          ...withoutExisting,
        ];


        /*
         * IMPORTANT:
         *
         * Await the cache write before
         * returning.
         *
         * AddMaterialScreen calls
         * navigation.goBack() only after
         * createTextMaterial() completes,
         * so the Materials screen will now
         * read the newly saved material.
         */
        await saveMaterialsCache(
          userId,
          subjectId,
          next,
        );


        setMaterials(
          next,
        );
      },
      [
        userId,
        subjectId,
      ],
    );

  // =========================================================
  // CREATE TEXT MATERIAL
  // =========================================================

  const createTextMaterial =
    useCallback(
      async (
        title: string,
        content: string,
      ): Promise<Material> => {

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


          /*
           * Queue when:
           *
           * Device is offline
           *
           * OR
           *
           * parent Subject was itself
           * created offline and still has
           * a temporary local ID.
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
          // OFFLINE CREATE
          // ===================================================

          if (
            shouldQueue
          ) {

            const localId =
              createLocalEntityId(
                'material',
              );


            const now =
              Date.now();


            const localMaterial:
              Material = {

                id:
                  localId,

                userId,

                subjectId,

                title,

                sourceType:
                  'text',

                content,

                createdAt:
                  now,

                updatedAt:
                  now,

                syncStatus:
                  'pending',
              };


            // -----------------------------------------------
            // Queue
            // -----------------------------------------------

            await enqueueSyncOperation(
              userId,
              {
                entity:
                  'material',

                action:
                  'create',

                payload: {
                  localId,

                  subjectId,

                  title,

                  content,
                },
              },
            );


            // -----------------------------------------------
            // Local state + cache
            // -----------------------------------------------

            await addMaterialToState(
              localMaterial,
            );


            console.log(
              '[OFFLINE MATERIAL] Created locally',
              {
                localId,
                subjectId,
                title,
              },
            );


            return localMaterial;
          }


          // ===================================================
          // ONLINE CREATE
          // ===================================================

          const material =
            await repository
              .createMaterial({
                userId,

                subjectId,

                title,

                sourceType:
                  'text',

                content,
              });


          await addMaterialToState(
            material,
          );


          return material;

        } catch (
          createError
        ) {

          console.warn(
            'Create text material error:',
            createError,
          );


          setError(
            createError instanceof Error
              ? createError.message
              : 'Unable to create material.',
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
        subjectId,
        userId,
        addMaterialToState,
        networkInitialized,
        isOnline,
      ],
    );


  // =========================================================
  // BACKWARD-COMPATIBLE CREATE
  // =========================================================

  const createMaterial =
    useCallback(
      async (
        title: string,

        sourceType:
          'text',

        content?: string,
      ) => {

        if (
          sourceType !==
            'text'
          ||
          !content
        ) {

          throw new Error(
            'This createMaterial() compatibility method supports text only.',
          );
        }


        return createTextMaterial(
          title,
          content,
        );
      },
      [
        createTextMaterial,
      ],
    );


  // =========================================================
  // CREATE PDF
  // =========================================================
  //
  // Supports both:
  //
  // Online:
  //   upload immediately to FastAPI
  //
  // Offline / local Subject:
  //   persist PDF locally
  //   create pending Material
  //   queue upload for reconnect
  //

  const createPdfMaterial =
    useCallback(
      async (
        title: string,
        fileUri: string,
        fileName: string,
        mimeType: string,
      ): Promise<Material> => {

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
          // OFFLINE CREATE
          // ===================================================

          if (
            shouldQueue
          ) {

            const localId =
              createLocalEntityId(
                'material',
              );


            const now =
              Date.now();


            // -------------------------------------------------
            // Copy the selected PDF into permanent app storage
            // -------------------------------------------------

            const persistedFile =
              await offlineFileStorageService
                .persistFile({
                  userId,

                  subjectId,

                  materialId:
                    localId,

                  sourceUri:
                    fileUri,

                  fileName,

                  sourceType:
                    'pdf',
                });


            try {

              // -----------------------------------------------
              // Queue server upload
              // -----------------------------------------------

              await enqueueSyncOperation(
                userId,
                {
                  entity:
                    'material',

                  action:
                    'create',

                  payload: {
                    localId,

                    subjectId,

                    title,

                    sourceType:
                      'pdf',

                    localFilePath:
                      persistedFile.localPath,

                    fileName,

                    mimeType,
                  },
                },
              );

            } catch (
              queueError
            ) {

              /*
               * If queue creation fails, remove the persistent
               * copy so we do not leave an orphan file behind.
               */

              try {

                await offlineFileStorageService
                  .deleteFile(
                    persistedFile.localPath,
                  );

              } catch (
                cleanupError
              ) {

                console.warn(
                  '[OFFLINE PDF] Cleanup after queue failure failed:',
                  cleanupError,
                );
              }


              throw queueError;
            }


            const localMaterial:
              Material = {

                id:
                  localId,

                userId,

                subjectId,

                title,

                sourceType:
                  'pdf',

                fileName,

                createdAt:
                  now,

                updatedAt:
                  now,

                syncStatus:
                  'pending',
              };


            await addMaterialToState(
              localMaterial,
            );


            console.log(
              '[OFFLINE PDF] Created locally',
              {
                localId,
                subjectId,
                localFilePath:
                  persistedFile.localPath,
              },
            );


            return localMaterial;
          }


          // ===================================================
          // ONLINE CREATE
          // ===================================================

          const material =
            await repository
              .createPdfMaterial({
                userId,

                subjectId,

                title,

                fileUri,

                fileName,

                mimeType,
              });


          /*
           * Keep an offline copy immediately after a successful
           * online upload. If this local persistence fails, the
           * server Material is still valid, so we only warn.
           */

          try {

            await offlineFileStorageService
              .persistFile({
                userId,

                subjectId,

                materialId:
                  material.id,

                sourceUri:
                  fileUri,

                fileName,

                sourceType:
                  'pdf',
              });

          } catch (
            persistError
          ) {

            console.warn(
              '[PDF MATERIAL] Uploaded successfully, but offline copy could not be saved:',
              persistError,
            );
          }


          await addMaterialToState(
            material,
          );


          return material;

        } catch (
          createError
        ) {

          console.warn(
            'Create PDF material error:',
            createError,
          );


          setError(
            createError instanceof Error
              ? createError.message
              : 'Unable to create PDF material.',
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
        subjectId,
        userId,
        addMaterialToState,
        networkInitialized,
        isOnline,
      ],
    );


  // =========================================================
  // CREATE IMAGE / CAMERA
  // =========================================================
  //
  // Gallery images and camera photos use the same existing
  // FastAPI image upload endpoint.
  //
  // Online:
  //   upload immediately
  //
  // Offline / local Subject:
  //   persist locally
  //   create pending Material
  //   queue upload for reconnect
  //
  // NOTE:
  // The current backend stores camera captures as sourceType
  // "image" as well. We preserve that existing behavior here.
  //

  const createImageMaterial =
    useCallback(
      async (
        title: string,
        fileUri: string,
        fileName: string,
        mimeType: string,
      ): Promise<Material> => {

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
          // OFFLINE CREATE
          // ===================================================

          if (
            shouldQueue
          ) {

            const localId =
              createLocalEntityId(
                'material',
              );


            const now =
              Date.now();


            // -------------------------------------------------
            // Persist image/camera photo in permanent app storage
            // -------------------------------------------------

            const persistedFile =
              await offlineFileStorageService
                .persistFile({
                  userId,

                  subjectId,

                  materialId:
                    localId,

                  sourceUri:
                    fileUri,

                  fileName,

                  sourceType:
                    'image',
                });


            try {

              // -----------------------------------------------
              // Queue server upload
              // -----------------------------------------------

              await enqueueSyncOperation(
                userId,
                {
                  entity:
                    'material',

                  action:
                    'create',

                  payload: {
                    localId,

                    subjectId,

                    title,

                    sourceType:
                      'image',

                    localFilePath:
                      persistedFile.localPath,

                    fileName,

                    mimeType,
                  },
                },
              );

            } catch (
              queueError
            ) {

              /*
               * If queue creation fails, remove the persisted
               * file so we do not leave an orphan behind.
               */

              try {

                await offlineFileStorageService
                  .deleteFile(
                    persistedFile.localPath,
                  );

              } catch (
                cleanupError
              ) {

                console.warn(
                  '[OFFLINE IMAGE] Cleanup after queue failure failed:',
                  cleanupError,
                );
              }


              throw queueError;
            }


            const localMaterial:
              Material = {

                id:
                  localId,

                userId,

                subjectId,

                title,

                sourceType:
                  'image',

                fileName,

                createdAt:
                  now,

                updatedAt:
                  now,

                syncStatus:
                  'pending',
              };


            await addMaterialToState(
              localMaterial,
            );


            console.log(
              '[OFFLINE IMAGE] Created locally',
              {
                localId,
                subjectId,
                localFilePath:
                  persistedFile.localPath,
              },
            );


            return localMaterial;
          }


          // ===================================================
          // ONLINE CREATE
          // ===================================================

          const material =
            await repository
              .createImageMaterial({
                userId,

                subjectId,

                title,

                fileUri,

                fileName,

                mimeType,
              });


          /*
           * Keep an offline copy immediately after successful
           * online upload. Failure to persist the offline copy
           * must not invalidate the successful server upload.
           */

          try {

            await offlineFileStorageService
              .persistFile({
                userId,

                subjectId,

                materialId:
                  material.id,

                sourceUri:
                  fileUri,

                fileName,

                sourceType:
                  'image',
              });

          } catch (
            persistError
          ) {

            console.warn(
              '[IMAGE MATERIAL] Uploaded successfully, but offline copy could not be saved:',
              persistError,
            );
          }


          await addMaterialToState(
            material,
          );


          return material;

        } catch (
          createError
        ) {

          console.warn(
            'Create image material error:',
            createError,
          );


          setError(
            createError instanceof Error
              ? createError.message
              : 'Unable to create image material.',
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
        subjectId,
        userId,
        addMaterialToState,
        networkInitialized,
        isOnline,
      ],
    );


  // =========================================================
  // UPDATE TEXT MATERIAL
  // =========================================================

  const updateTextMaterial =
    useCallback(
      async (
        materialId: string,
        title: string,
        content: string,
      ) => {

        if (!userId) {

          throw new Error(
            'You must be logged in.',
          );
        }


        try {

          setUpdatingMaterialId(
            materialId,
          );


          setError(
            null,
          );


          /*
           * Queue when:
           *
           * Offline
           *
           * OR material still has local ID
           *
           * OR parent Subject still has local ID
           */

          const shouldQueue =
            (
              networkInitialized
              &&
              !isOnline
            )
            ||
            isLocalEntityId(
              materialId,
            )
            ||
            isLocalEntityId(
              subjectId,
            );


          // ===================================================
          // OFFLINE UPDATE
          // ===================================================

          if (
            shouldQueue
          ) {

            await enqueueSyncOperation(
              userId,
              {
                entity:
                  'material',

                action:
                  'update',

                payload: {
                  materialId,

                  subjectId,

                  title,

                  content,
                },
              },
            );


            setMaterials(
              current => {

                const next:
                  Material[] =
                  current.map(
                    material =>
                      material.id ===
                      materialId
                        ? {
                            ...material,

                            title,

                            content,

                            updatedAt:
                              Date.now(),

                            syncStatus:
                              'pending' as const,
                          }
                        : material,
                  );


                void saveMaterialsCache(
                  userId,
                  subjectId,
                  next,
                );


                return next;
              },
            );


            console.log(
              '[OFFLINE MATERIAL] Update queued',
              {
                materialId,
                subjectId,
              },
            );


            return;
          }


          // ===================================================
          // ONLINE UPDATE
          // ===================================================

          await repository
            .updateMaterial(
              materialId,
              {
                title,

                content,
              },
            );


          await loadMaterials();

        } catch (
          updateError
        ) {

          console.warn(
            'Update text material error:',
            updateError,
          );


          setError(
            updateError instanceof Error
              ? updateError.message
              : 'Unable to update material.',
          );


          throw updateError;

        } finally {

          setUpdatingMaterialId(
            null,
          );
        }
      },
      [
        repository,
        userId,
        subjectId,
        networkInitialized,
        isOnline,
        loadMaterials,
      ],
    );


  // =========================================================
  // BACKWARD-COMPATIBLE UPDATE
  // =========================================================

  const updateMaterial =
    useCallback(
      async (
        materialId: string,
        title: string,
        content?: string,
      ) => {

        if (
          !content
        ) {

          throw new Error(
            'Text material content is required.',
          );
        }


        return updateTextMaterial(
          materialId,
          title,
          content,
        );
      },
      [
        updateTextMaterial,
      ],
    );


  // =========================================================
  // UPDATE IMAGE TITLE
  // =========================================================
  //
  // Still online-only.
  //

  const updateImageTitle =
    useCallback(
      async (
        materialId: string,
        title: string,
      ) => {

        if (!userId) {

          throw new Error(
            'You must be logged in.',
          );
        }


        requireOnline();


        if (
          isLocalEntityId(
            materialId,
          )
          ||
          isLocalEntityId(
            subjectId,
          )
        ) {

          throw new Error(
            'Please reconnect before updating this image.',
          );
        }


        try {

          setUpdatingMaterialId(
            materialId,
          );


          setError(
            null,
          );


          await repository
            .updateImageTitle(
              materialId,
              title,
            );


          await loadMaterials();

        } catch (
          updateError
        ) {

          console.warn(
            'Update image title error:',
            updateError,
          );


          setError(
            updateError instanceof Error
              ? updateError.message
              : 'Unable to update image title.',
          );


          throw updateError;

        } finally {

          setUpdatingMaterialId(
            null,
          );
        }
      },
      [
        repository,
        userId,
        subjectId,
        requireOnline,
        loadMaterials,
      ],
    );


  // =========================================================
  // DELETE MATERIAL
  // =========================================================

  const deleteMaterial =
    useCallback(
      async (
        materialId: string,
      ) => {

        if (!userId) {

          throw new Error(
            'You must be logged in.',
          );
        }


        try {

          setDeletingMaterialId(
            materialId,
          );


          setError(
            null,
          );


          // ===================================================
          // LOCAL-ONLY MATERIAL
          // ===================================================
          //
          // Created offline and deleted
          // before ever reaching FastAPI.
          //

          if (
            isLocalEntityId(
              materialId,
            )
          ) {

            await removeLocalEntityOperations(
              userId,
              materialId,
            );


            setMaterials(
              current => {

                const next =
                  current.filter(
                    material =>
                      material.id !==
                      materialId,
                  );


                void saveMaterialsCache(
                  userId,
                  subjectId,
                  next,
                );


                return next;
              },
            );


            console.log(
              '[OFFLINE MATERIAL] Local material removed',
              {
                materialId,
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
                  'material',

                action:
                  'delete',

                payload: {
                  materialId,

                  subjectId,
                },
              },
            );


            setMaterials(
              current => {

                const next =
                  current.filter(
                    material =>
                      material.id !==
                      materialId,
                  );


                void saveMaterialsCache(
                  userId,
                  subjectId,
                  next,
                );


                return next;
              },
            );


            console.log(
              '[OFFLINE MATERIAL] Delete queued',
              {
                materialId,
                subjectId,
              },
            );


            return;
          }


          // ===================================================
          // ONLINE DELETE
          // ===================================================

          await repository
            .deleteMaterial(
              materialId,
            );


          setMaterials(
            current => {

              const next =
                current.filter(
                  material =>
                    material.id !==
                    materialId,
                );


              void saveMaterialsCache(
                userId,
                subjectId,
                next,
              );


              return next;
            },
          );

        } catch (
          deleteError
        ) {

          console.warn(
            'Delete material error:',
            deleteError,
          );


          setError(
            deleteError instanceof Error
              ? deleteError.message
              : 'Unable to delete material.',
          );


          throw deleteError;

        } finally {

          setDeletingMaterialId(
            null,
          );
        }
      },
      [
        repository,
        userId,
        subjectId,
        networkInitialized,
        isOnline,
      ],
    );


  // =========================================================
  // RETURN
  // =========================================================

  return {
    materials,

    loading,
    creating,

    updatingMaterialId,
    deletingMaterialId,

    error,

    loadMaterials,

    createTextMaterial,
    createMaterial,

    createPdfMaterial,
    createImageMaterial,

    updateTextMaterial,
    updateMaterial,
    updateImageTitle,

    deleteMaterial,
  };
};
