import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Material,
  MaterialSourceType,
} from '../domain/models/Material';

import {
  MaterialRepositoryImpl,
} from '../data/repositories/MaterialRepositoryImpl';

import {
  MaterialStorageService,
} from '../services/storage/MaterialStorageService';

import {useAuth} from './useAuth';

export const useMaterials = (
  subjectId: string,
) => {
  const {user} =
    useAuth();

  const repository =
    useMemo(
      () =>
        new MaterialRepositoryImpl(),
      [],
    );

  const storageService =
    useMemo(
      () =>
        new MaterialStorageService(),
      [],
    );

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
  ] = useState<
    string | null
  >(null);

  const [
    deletingMaterialId,
    setDeletingMaterialId,
  ] = useState<
    string | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  // =========================================================
  // Load materials
  // =========================================================

  const loadMaterials =
    useCallback(
      async () => {
        if (!user) {
          setMaterials([]);
          setLoading(false);

          return;
        }

        if (!subjectId) {
          setMaterials([]);
          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError(null);

          const result =
            await repository
              .getMaterials(
                user.uid,
                subjectId,
              );

          setMaterials(
            result,
          );
        } catch (err) {
          console.error(
            'Failed to load materials:',
            err,
          );

          setError(
            'Unable to load materials.',
          );
        } finally {
          setLoading(false);
        }
      },
      [
        repository,
        subjectId,
        user,
      ],
    );

  // =========================================================
  // Create material
  // =========================================================

  const createMaterial =
    async (
      title: string,
      sourceType:
        MaterialSourceType,
      content?: string,
      fileName?: string,
      fileUrl?: string,
    ) => {
      if (!user) {
        throw new Error(
          'User is not authenticated.',
        );
      }

      const trimmedTitle =
        title.trim();

      if (!trimmedTitle) {
        throw new Error(
          'Material title is required.',
        );
      }

      if (!subjectId) {
        throw new Error(
          'Subject is required.',
        );
      }

      try {
        setCreating(true);
        setError(null);

        const newMaterial =
          await repository
            .createMaterial({
              userId:
                user.uid,

              subjectId,

              title:
                trimmedTitle,

              sourceType,

              content:
                content?.trim() ||
                undefined,

              fileName:
                fileName?.trim() ||
                undefined,

              fileUrl:
                fileUrl?.trim() ||
                undefined,
            });

        setMaterials(
          currentMaterials => [
            newMaterial,
            ...currentMaterials,
          ],
        );

        return newMaterial;
      } catch (err) {
        console.error(
          'Failed to create material:',
          err,
        );

        setError(
          'Unable to create material.',
        );

        throw err;
      } finally {
        setCreating(false);
      }
    };

  // =========================================================
  // Update material
  // =========================================================

  const updateMaterial =
    async (
      materialId: string,
      title: string,
      content?: string,
      fileName?: string,
      fileUrl?: string,
    ) => {
      if (!user) {
        throw new Error(
          'User is not authenticated.',
        );
      }

      const trimmedTitle =
        title.trim();

      if (!trimmedTitle) {
        throw new Error(
          'Material title is required.',
        );
      }

      try {
        setUpdatingMaterialId(
          materialId,
        );

        setError(null);

        await repository
          .updateMaterial(
            materialId,
            {
              title:
                trimmedTitle,

              content:
                content !==
                undefined
                  ? content.trim()
                  : undefined,

              fileName:
                fileName !==
                undefined
                  ? fileName.trim()
                  : undefined,

              fileUrl:
                fileUrl !==
                undefined
                  ? fileUrl.trim()
                  : undefined,
            },
          );

        const updatedAt =
          Date.now();

        setMaterials(
          currentMaterials =>
            currentMaterials.map(
              material =>
                material.id ===
                materialId
                  ? {
                      ...material,

                      title:
                        trimmedTitle,

                      content:
                        content !==
                        undefined
                          ? content.trim()
                          : material.content,

                      fileName:
                        fileName !==
                        undefined
                          ? fileName.trim()
                          : material.fileName,

                      fileUrl:
                        fileUrl !==
                        undefined
                          ? fileUrl.trim()
                          : material.fileUrl,

                      updatedAt,

                      syncStatus:
                        'synced',
                    }
                  : material,
            ),
        );
      } catch (err) {
        console.error(
          'Failed to update material:',
          err,
        );

        setError(
          'Unable to update material.',
        );

        throw err;
      } finally {
        setUpdatingMaterialId(
          null,
        );
      }
    };

  // =========================================================
  // Delete material
  // =========================================================

  const deleteMaterial =
    async (
      materialId: string,
    ) => {
      if (!user) {
        throw new Error(
          'User is not authenticated.',
        );
      }

      const materialToDelete =
        materials.find(
          material =>
            material.id ===
            materialId,
        );

      try {
        setDeletingMaterialId(
          materialId,
        );

        setError(null);

        /*
         * Delete Firestore record first.
         *
         * If the database deletion
         * succeeds, the material should
         * disappear from the application
         * even if Storage cleanup later
         * encounters a problem.
         */
        await repository
          .deleteMaterial(
            materialId,
          );

        setMaterials(
          currentMaterials =>
            currentMaterials.filter(
              material =>
                material.id !==
                materialId,
            ),
        );

        /*
         * Text materials do not have
         * physical files.
         *
         * PDF, image and camera
         * materials can have fileUrl,
         * so clean up Firebase Storage.
         */
        if (
          materialToDelete
            ?.fileUrl
        ) {
          try {
            await storageService
              .deleteFile(
                materialToDelete
                  .fileUrl,
              );
          } catch (
            storageError
          ) {
            /*
             * Firestore deletion already
             * succeeded, so do not tell
             * the UI that the whole
             * deletion failed.
             *
             * Log the cleanup problem.
             */
            console.error(
              'Failed to delete material file from Storage:',
              storageError,
            );
          }
        }
      } catch (err) {
        console.error(
          'Failed to delete material:',
          err,
        );

        setError(
          'Unable to delete material.',
        );

        throw err;
      } finally {
        setDeletingMaterialId(
          null,
        );
      }
    };

  // =========================================================
  // Initial load
  // =========================================================

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  return {
    materials,

    loading,
    creating,

    updatingMaterialId,
    deletingMaterialId,

    error,

    loadMaterials,

    createMaterial,
    updateMaterial,
    deleteMaterial,
  };
};