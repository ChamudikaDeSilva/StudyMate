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
  useAuth,
} from './useAuth';

import {
  useNetwork,
} from './useNetwork';


export const useMaterials = (
  subjectId: string,
) => {
  const {user} = useAuth();

  const {
    isOnline,
    initialized: networkInitialized,
  } = useNetwork();


  const repository =
    useMemo(
      () =>
        new MaterialApiRepositoryImpl(),
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
  // Load materials
  // =========================================================

  const loadMaterials =
    useCallback(
      async () => {
        if (!userId) {
          setMaterials([]);
          setLoading(false);

          return;
        }


        try {
          setLoading(true);
          setError(null);


          /*
           * Load local materials first.
           *
           * Text material content is part
           * of the Material object, so
           * text content is also available
           * offline.
           */
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


          /*
           * Wait until NetInfo knows
           * the connection state.
           */
          if (!networkInitialized) {
            return;
          }


          /*
           * Offline:
           *
           * Keep cached materials.
           */
          if (!isOnline) {
            setMaterials(
              cachedMaterials,
            );

            return;
          }


          /*
           * Online:
           *
           * Refresh from FastAPI and
           * replace the local cache.
           */
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

          } catch (remoteError) {
            console.warn(
              'Load materials API error:',
              remoteError,
            );


            /*
             * FastAPI may be temporarily
             * unavailable even when the
             * phone has network access.
             */
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

        } catch (loadError) {
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
          setLoading(false);
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


  useEffect(() => {
    void loadMaterials();
  }, [loadMaterials]);


  // =========================================================
  // Add material to state + cache
  // =========================================================

  const addMaterialToState =
    useCallback(
      (
        material: Material,
      ) => {

        setMaterials(
          current => {
            const next = [
              material,
              ...current,
            ];


            if (userId) {
              void saveMaterialsCache(
                userId,
                subjectId,
                next,
              );
            }


            return next;
          },
        );
      },
      [
        userId,
        subjectId,
      ],
    );


  // =========================================================
  // Create text
  // =========================================================

  const createTextMaterial =
    useCallback(
      async (
        title: string,
        content: string,
      ) => {

        if (!userId) {
          throw new Error(
            'You must be logged in.',
          );
        }


        requireOnline();


        try {
          setCreating(true);
          setError(null);


          const material =
            await repository
              .createMaterial({
                userId,
                subjectId,
                title,
                sourceType: 'text',
                content,
              });


          addMaterialToState(
            material,
          );


          return material;

        } catch (createError) {
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
          setCreating(false);
        }
      },
      [
        repository,
        subjectId,
        userId,
        addMaterialToState,
        requireOnline,
      ],
    );


  // =========================================================
  // Backward-compatible create alias
  // =========================================================

  const createMaterial =
    useCallback(
      async (
        title: string,
        sourceType: 'text',
        content?: string,
      ) => {

        if (
          sourceType !== 'text' ||
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
  // Create PDF
  // =========================================================

  const createPdfMaterial =
    useCallback(
      async (
        title: string,
        fileUri: string,
        fileName: string,
        mimeType: string,
      ) => {

        if (!userId) {
          throw new Error(
            'You must be logged in.',
          );
        }


        requireOnline();


        try {
          setCreating(true);
          setError(null);


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


          addMaterialToState(
            material,
          );


          return material;

        } catch (createError) {
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
          setCreating(false);
        }
      },
      [
        repository,
        subjectId,
        userId,
        addMaterialToState,
        requireOnline,
      ],
    );


  // =========================================================
  // Create image
  // =========================================================

  const createImageMaterial =
    useCallback(
      async (
        title: string,
        fileUri: string,
        fileName: string,
        mimeType: string,
      ) => {

        if (!userId) {
          throw new Error(
            'You must be logged in.',
          );
        }


        requireOnline();


        try {
          setCreating(true);
          setError(null);


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


          addMaterialToState(
            material,
          );


          return material;

        } catch (createError) {
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
          setCreating(false);
        }
      },
      [
        repository,
        subjectId,
        userId,
        addMaterialToState,
        requireOnline,
      ],
    );


  // =========================================================
  // Update text
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


        requireOnline();


        try {
          setUpdatingMaterialId(
            materialId,
          );

          setError(null);


          await repository
            .updateMaterial(
              materialId,
              {
                title,
                content,
              },
            );


          /*
           * Refresh server version.
           *
           * loadMaterials() also updates
           * the local cache.
           */
          await loadMaterials();

        } catch (updateError) {
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
        requireOnline,
        loadMaterials,
      ],
    );


  // =========================================================
  // Backward-compatible update alias
  // =========================================================

  const updateMaterial =
    useCallback(
      async (
        materialId: string,
        title: string,
        content?: string,
      ) => {

        if (!content) {
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
  // Update image title
  // =========================================================

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


        try {
          setUpdatingMaterialId(
            materialId,
          );

          setError(null);


          await repository
            .updateImageTitle(
              materialId,
              title,
            );


          await loadMaterials();

        } catch (updateError) {
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
        requireOnline,
        loadMaterials,
      ],
    );


  // =========================================================
  // Delete
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


        requireOnline();


        try {
          setDeletingMaterialId(
            materialId,
          );

          setError(null);


          await repository
            .deleteMaterial(
              materialId,
            );


          setMaterials(
            current => {
              const next =
                current.filter(
                  item =>
                    item.id !==
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

        } catch (deleteError) {
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
        requireOnline,
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