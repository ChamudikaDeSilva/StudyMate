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
  MaterialApiRepositoryImpl,
} from '../data/repositories/MaterialApiRepositoryImpl';

import {
  useAuth,
} from './useAuth';


export const useMaterials = (
  subjectId: string,
) => {

  const {
    user,
  } = useAuth();


  const repository =
    useMemo(
      () =>
        new MaterialApiRepositoryImpl(),
      [],
    );


  const [
    materials,
    setMaterials,
  ] = useState<
    Material[]
  >([]);


  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );


  const [
    creating,
    setCreating,
  ] = useState(
    false,
  );


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
  // LOAD
  // =========================================================

  const loadMaterials =
    useCallback(
      async () => {

        if (!user) {

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


          const result =
            await repository
              .getMaterials(
                String(
                  user.id,
                ),

                subjectId,
              );


          setMaterials(
            result,
          );

        } catch (
          loadError
        ) {

          console.error(
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
        user,
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
  // CREATE TEXT
  // =========================================================

  const createMaterial =
    useCallback(
      async (
        title: string,
        sourceType:
          MaterialSourceType,
        content?: string,
      ) => {

        if (!user) {

          throw new Error(
            'You must be logged in.',
          );
        }


        try {

          setCreating(
            true,
          );


          const material =
            await repository
              .createMaterial({
                userId:
                  String(
                    user.id,
                  ),

                subjectId,

                title,

                sourceType,

                content,
              });


          setMaterials(
            current => [
              material,
              ...current,
            ],
          );


          return material;

        } finally {

          setCreating(
            false,
          );
        }
      },
      [
        repository,
        subjectId,
        user,
      ],
    );


  // =========================================================
  // CREATE PDF
  // =========================================================

  const createPdfMaterial =
    useCallback(
      async (
        title: string,
        fileUri: string,
        fileName: string,
        mimeType: string,
      ) => {

        if (!user) {

          throw new Error(
            'You must be logged in.',
          );
        }


        try {

          setCreating(
            true,
          );


          const material =
            await repository
              .createPdfMaterial({
                userId:
                  String(
                    user.id,
                  ),

                subjectId,

                title,

                fileUri,

                fileName,

                mimeType,
              });


          setMaterials(
            current => [
              material,
              ...current,
            ],
          );


          return material;

        } finally {

          setCreating(
            false,
          );
        }
      },
      [
        repository,
        subjectId,
        user,
      ],
    );


  // =========================================================
  // CREATE IMAGE / CAMERA
  // =========================================================

  const createImageMaterial =
    useCallback(
      async (
        title: string,
        fileUri: string,
        fileName: string,
        mimeType: string,
      ) => {

        if (!user) {

          throw new Error(
            'You must be logged in.',
          );
        }


        try {

          setCreating(
            true,
          );


          const material =
            await repository
              .createImageMaterial({
                userId:
                  String(
                    user.id,
                  ),

                subjectId,

                title,

                fileUri,

                fileName,

                mimeType,
              });


          setMaterials(
            current => [
              material,
              ...current,
            ],
          );


          return material;

        } finally {

          setCreating(
            false,
          );
        }
      },
      [
        repository,
        subjectId,
        user,
      ],
    );


  // =========================================================
  // UPDATE TEXT
  // =========================================================

  const updateMaterial =
    useCallback(
      async (
        materialId: string,
        title: string,
        content?: string,
      ) => {

        try {

          setUpdatingMaterialId(
            materialId,
          );


          await repository
            .updateMaterial(
              materialId,
              {
                title,
                content,
              },
            );


          await loadMaterials();

        } finally {

          setUpdatingMaterialId(
            null,
          );
        }
      },
      [
        repository,
        loadMaterials,
      ],
    );


  // =========================================================
  // UPDATE IMAGE TITLE
  // =========================================================

  const updateImageTitle =
    useCallback(
      async (
        materialId: string,
        title: string,
      ) => {

        try {

          setUpdatingMaterialId(
            materialId,
          );


          await repository
            .updateImageTitle(
              materialId,
              title,
            );


          await loadMaterials();

        } finally {

          setUpdatingMaterialId(
            null,
          );
        }
      },
      [
        repository,
        loadMaterials,
      ],
    );


  // =========================================================
  // DELETE
  // =========================================================

  const deleteMaterial =
    useCallback(
      async (
        materialId: string,
      ) => {

        try {

          setDeletingMaterialId(
            materialId,
          );


          await repository
            .deleteMaterial(
              materialId,
            );


          setMaterials(
            current =>
              current.filter(
                material =>
                  material.id !==
                  materialId,
              ),
          );

        } finally {

          setDeletingMaterialId(
            null,
          );
        }
      },
      [
        repository,
      ],
    );


  return {
    materials,

    loading,

    creating,

    updatingMaterialId,

    deletingMaterialId,

    error,

    loadMaterials,

    createMaterial,

    createPdfMaterial,

    createImageMaterial,

    updateMaterial,

    updateImageTitle,

    deleteMaterial,
  };
};