import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
} from 'react-native';

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
    materials,

    loading,

    updatingMaterialId,

    deletingMaterialId,

    error,

    loadMaterials,

    updateTextMaterial,

    updateImageTitle,

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

  const canEdit =

    material?.sourceType ===
      'text'

    ||

    material?.sourceType ===
      'image';


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

          Alert.alert(
            'Title required',

            'Please enter a material title.',
          );


          return;
        }


        try {

          // ===============================================
          // IMAGE
          // ===============================================

          if (
            material.sourceType ===
            'image'
          ) {

            await updateImageTitle(
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

          if (
            material.sourceType !==
            'text'
          ) {

            return;
          }


          const cleanContent =
            content.trim();


          if (
            !cleanContent
          ) {

            Alert.alert(
              'Content required',

              'Please enter study content.',
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

          Alert.alert(
            'Unable to update material',

            saveError instanceof Error
              ? saveError.message
              : 'Unable to update material.',
          );
        }

      },
      [
        material,
        busy,
        title,
        content,
        updateImageTitle,
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


        Alert.alert(
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

                    Alert.alert(
                      'Unable to delete material',

                      deleteError instanceof Error
                        ? deleteError.message
                        : 'Unable to delete material.',
                    );
                  }
                },
            },
          ],
        );

      },
      [
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