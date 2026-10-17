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
  updateMaterialsCache,
} from '../data/local/storage/offlineCache';

import {
  createLocalEntityId,
  enqueueSyncOperation,
  getPendingSyncOperations,
  isLocalEntityId,
  removeLocalEntityOperations,
} from '../data/local/sync/pendingSyncQueue';
import { reconcileMaterials } from '../data/local/sync/reconcileMaterials';

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

  const commitMaterials = useCallback(
    async (update: (current: Material[]) => Material[] | Promise<Material[]>) => {
      if (!userId) {
        return;
      }
      const next = await updateMaterialsCache(userId, subjectId, update);
      setMaterials(next);
    },
    [userId, subjectId],
  );


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

            const operationsBefore = await getPendingSyncOperations(userId);

            const result =
              await repository
                .getMaterials(
                  userId,
                  subjectId,
                );


            const next = await updateMaterialsCache(userId, subjectId, async cachedNow =>
              reconcileMaterials({
                userId,
                subjectId,
                remote: result,
                cachedBefore: cachedMaterials,
                cachedNow,
                operationsBefore,
                operationsNow: await getPendingSyncOperations(userId),
              }),
            );
            setMaterials(next);

          } catch (
            remoteError
          ) {

            console.warn(
              'Load materials API error:',
              remoteError,
            );


            let hasPendingChanges = false;
            const fallback = await updateMaterialsCache(userId, subjectId, async current => {
              const operations = await getPendingSyncOperations(userId);
              hasPendingChanges = operations.some(operation =>
                operation.entity === 'material' &&
                'subjectId' in operation.payload && operation.payload.subjectId === subjectId,
              );
              return reconcileMaterials({
                userId,
                subjectId,
                remote: current,
                cachedBefore: current,
                cachedNow: current,
                operationsBefore: [],
                operationsNow: operations,
              });
            });
            if (fallback.length > 0 || cachedMaterials.length > 0 || hasPendingChanges) {
              setMaterials(fallback);
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

      loadMaterials();

    },
    [
      loadMaterials,
    ],
  );


  // =========================================================
  // ADD MATERIAL TO STATE + CACHE
  // =========================================================

  const addMaterialToState = useCallback(
    async (material: Material): Promise<void> => {
      await commitMaterials(current => [
        material,
        ...current.filter(item => item.id !== material.id),
      ]);
    },
    [commitMaterials],
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


  // Text edits and file-title edits share the same persistence and replay path.
  const updateMaterial = useCallback(
    async (materialId: string, title: string, content?: string) => {
      if (!userId) {
        throw new Error('You must be logged in.');
      }
      const cleanTitle = title.trim();
      const cleanContent = content?.trim();
      if (!cleanTitle) {
        throw new Error('Material title is required.');
      }
      if (cleanTitle.length > 200) {
        throw new Error('Material title must be 200 characters or fewer.');
      }
      if (content !== undefined && !cleanContent) {
        throw new Error('Text material content is required.');
      }

      try {
        setUpdatingMaterialId(materialId);
        setError(null);
        const pending = await getPendingSyncOperations(userId);
        const hasPendingWork = pending.some(operation =>
          operation.entity === 'material' &&
          (('materialId' in operation.payload && operation.payload.materialId === materialId) ||
            ('localId' in operation.payload && operation.payload.localId === materialId)),
        );
        const shouldQueue =
          !networkInitialized || !isOnline ||
          isLocalEntityId(materialId) || isLocalEntityId(subjectId) || hasPendingWork;
        const changes = {
          title: cleanTitle,
          ...(cleanContent === undefined ? {} : { content: cleanContent }),
        };

        if (shouldQueue) {
          await commitMaterials(async current => {
            if (!current.some(material => material.id === materialId)) {
              throw new Error('Material not found in the saved library.');
            }
            await enqueueSyncOperation(userId, {
              entity: 'material',
              action: 'update',
              payload: cleanContent === undefined
                ? { materialId, subjectId, title: cleanTitle, kind: 'title' }
                : { materialId, subjectId, title: cleanTitle, content: cleanContent },
            });
            return current.map(material => material.id === materialId
              ? { ...material, ...changes, updatedAt: Date.now(), syncStatus: 'pending' }
              : material,
            );
          });
        } else {
          if (cleanContent === undefined) {
            await repository.updateMaterialTitle(materialId, cleanTitle);
          } else {
            await repository.updateMaterial(materialId, { title: cleanTitle, content: cleanContent });
          }
          await commitMaterials(current => current.map(material => material.id === materialId
            ? { ...material, ...changes, updatedAt: Date.now(), syncStatus: 'synced' }
            : material,
          ));
          await loadMaterials();
        }
      } catch (updateError) {
        console.warn('Update material error:', updateError);
        setError(updateError instanceof Error ? updateError.message : 'Unable to update material.');
        throw updateError;
      } finally {
        setUpdatingMaterialId(null);
      }
    },
    [repository, userId, subjectId, networkInitialized, isOnline, loadMaterials, commitMaterials],
  );

  const updateTextMaterial = useCallback(
    (materialId: string, title: string, content: string) => updateMaterial(materialId, title, content),
    [updateMaterial],
  );

  const updateMaterialTitle = useCallback(
    (materialId: string, title: string) => updateMaterial(materialId, title),
    [updateMaterial],
  );

  // Retained for callers that previously used the image-specific method.
  const updateImageTitle = updateMaterialTitle;


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

          if (isLocalEntityId(materialId) && (!networkInitialized || !isOnline)) {
            const previous = (await getMaterialsCache(userId, subjectId))
              .find(material => material.id === materialId);
            // Persist removal before cancelling upload, so a failed cache write
            // cannot leave a visible local note without its queued creation.
            await commitMaterials(current =>
              current.filter(material => material.id !== materialId),
            );
            try {
              await removeLocalEntityOperations(userId, materialId);
            } catch (queueError) {
              if (previous) {
                await commitMaterials(current => [
                  previous,
                  ...current.filter(material => material.id !== materialId),
                ]);
              }
              throw queueError;
            }


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

          const pending = await getPendingSyncOperations(userId);
          const hasPendingWork = pending.some(operation =>
            operation.entity === 'material' &&
            (('materialId' in operation.payload && operation.payload.materialId === materialId) ||
              ('localId' in operation.payload && operation.payload.localId === materialId)),
          );
          if (!networkInitialized || !isOnline || isLocalEntityId(materialId) || hasPendingWork) {

            await commitMaterials(async current => {
              await enqueueSyncOperation(userId, {
                entity: 'material',
                action: 'delete',
                payload: { materialId, subjectId },
              });
              return current.filter(material => material.id !== materialId);
            });


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


          await commitMaterials(current =>
            current.filter(material => material.id !== materialId),
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
        commitMaterials,
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
    updateMaterialTitle,
    updateMaterial,
    updateImageTitle,

    deleteMaterial,
  };
};
