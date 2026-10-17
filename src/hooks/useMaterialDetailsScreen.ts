import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useAppAlert,
} from './useAppAlert';

import {
  useMaterials,
} from './useMaterials';


interface UseMaterialDetailsScreenParams {

  subjectId:
    string;

  materialId:
    string;

  onDeleted:
    () => void;
}


export const useMaterialDetailsScreen = ({
  subjectId,
  materialId,
  onDeleted,
}: UseMaterialDetailsScreenParams) => {

  const {
    alert,
  } = useAppAlert();

  const {
    materials,

    loading,

    updatingMaterialId,

    deletingMaterialId,

    error,

    loadMaterials,

    updateTextMaterial,

    updateMaterialTitle,

    deleteMaterial,
  } = useMaterials(
    subjectId,
  );


  // =========================================================
  // CURRENT MATERIAL
  // =========================================================

  const material =
    useMemo(
      () => {

        return materials.find(
          item =>
            item.id ===
            materialId,
        );

      },
      [
        materials,
        materialId,
      ],
    );


  // =========================================================
  // EDIT STATE
  // =========================================================

  const [
    editing,
    setEditing,
  ] = useState(
    false,
  );


  const [
    title,
    setTitle,
  ] = useState(
    '',
  );


  const [
    content,
    setContent,
  ] = useState(
    '',
  );


  // =========================================================
  // OPERATION STATE
  // =========================================================

  const isUpdating =
    updatingMaterialId ===
    materialId;


  const isDeleting =
    deletingMaterialId ===
    materialId;


  const busy =
    isUpdating ||
    isDeleting;


  // =========================================================
  // MATERIAL CAPABILITIES
  // =========================================================

  const canEdit = !!material;


  const canGenerateSummary =
    !!material &&
    !busy;


  // =========================================================
  // POPULATE FORM
  // =========================================================

  useEffect(
    () => {

      if (
        !material
      ) {

        return;
      }


      setTitle(
        material.title,
      );


      setContent(
        material.content ??
        '',
      );

    },
    [
      material,
    ],
  );


  // =========================================================
  // START EDITING
  // =========================================================

  const startEditing =
    useCallback(
      () => {

        if (
          !material ||
          busy ||
          !canEdit
        ) {

          return;
        }


        setTitle(
          material.title,
        );


        setContent(
          material.content ??
          '',
        );


        setEditing(
          true,
        );

      },
      [
        material,
        busy,
        canEdit,
      ],
    );


  // =========================================================
  // CANCEL EDITING
  // =========================================================

  const cancelEditing =
    useCallback(
      () => {

        if (
          !material ||
          busy
        ) {

          return;
        }


        setTitle(
          material.title,
        );


        setContent(
          material.content ??
          '',
        );


        setEditing(
          false,
        );

      },
      [
        material,
        busy,
      ],
    );


  // =========================================================
  // SAVE
  // =========================================================

  const saveMaterial =
    useCallback(
      async () => {

        if (
          !material ||
          busy
        ) {

          return;
        }


        const cleanTitle =
          title.trim();


        if (
          !cleanTitle
        ) {

          alert(
            'Title required',

            'Please enter a material title.',

            undefined,

            { tone: 'warning' },
          );


          return;
        }


        try {

          // ===============================================
          // FILE TITLE
          // ===============================================

          if (
            material.sourceType !==
            'text'
          ) {

            await updateMaterialTitle(
              material.id,
              cleanTitle,
            );


            setEditing(
              false,
            );


            return;
          }


          // ===============================================
          // TEXT
          // ===============================================

          const cleanContent =
            content.trim();


          if (
            !cleanContent
          ) {

            alert(
              'Content required',

              'Please enter study content.',

              undefined,

              { tone: 'warning' },
            );


            return;
          }


          await updateTextMaterial(
            material.id,

            cleanTitle,

            cleanContent,
          );


          setEditing(
            false,
          );

        } catch (
          saveError
        ) {

          alert(
            'Unable to update material',

            saveError instanceof Error
              ? saveError.message
              : 'Unable to update material.',

            undefined,

            { tone: 'danger' },
          );
        }

      },
      [
        alert,
        material,
        busy,
        title,
        content,
        updateMaterialTitle,
        updateTextMaterial,
      ],
    );


  // =========================================================
  // DELETE
  // =========================================================

  const deleteCurrentMaterial =
    useCallback(
      () => {

        if (
          !material ||
          busy
        ) {

          return;
        }


        alert(
          'Delete material',

          `Are you sure you want to delete "${material.title}"?`,

          [
            {
              text:
                'Cancel',

              style:
                'cancel',
            },

            {
              text:
                'Delete',

              style:
                'destructive',

              onPress:
                async () => {

                  try {

                    await deleteMaterial(
                      material.id,
                    );


                    onDeleted();

                  } catch (
                    deleteError
                  ) {

                    alert(
                      'Unable to delete material',

                      deleteError instanceof Error
                        ? deleteError.message
                        : 'Unable to delete material.',

                      undefined,

                      { tone: 'danger' },
                    );
                  }
                },
            },
          ],

          { tone: 'danger', icon: 'delete' },
        );

      },
      [
        alert,
        material,
        busy,
        deleteMaterial,
        onDeleted,
      ],
    );


  // =========================================================
  // RETURN
  // =========================================================

  return {

    // Data
    material,

    // Load state
    loading,
    error,
    loadMaterials,

    // Edit state
    editing,
    title,
    content,

    setTitle,
    setContent,

    // Capabilities
    canEdit,
    canGenerateSummary,

    // Operation state
    busy,
    isUpdating,
    isDeleting,

    // Actions
    startEditing,
    cancelEditing,
    saveMaterial,
    deleteCurrentMaterial,
  };
};