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

import {MaterialRepositoryImpl} from '../data/repositories/MaterialRepositoryImpl';

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
            await repository.getMaterials(
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
          await repository.createMaterial({
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
              fileName ||
              undefined,

            fileUrl:
              fileUrl ||
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

        await repository.updateMaterial(
          materialId,
          {
            title:
              trimmedTitle,

            content:
              content !== undefined
                ? content.trim()
                : undefined,

            fileName:
              fileName !== undefined
                ? fileName
                : undefined,

            fileUrl:
              fileUrl !== undefined
                ? fileUrl
                : undefined,
          },
        );

        const updatedAt =
          Date.now();

        /*
         * Update local state without
         * destroying existing optional
         * values when a new value was
         * not supplied.
         */
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
                          ? fileName
                          : material.fileName,

                      fileUrl:
                        fileUrl !==
                        undefined
                          ? fileUrl
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

      try {
        setDeletingMaterialId(
          materialId,
        );

        setError(null);

        await repository.deleteMaterial(
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