import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  useMaterials,
} from './useMaterials';


export type MaterialFilter =
  | 'all'
  | 'text'
  | 'pdf'
  | 'image';


export const useSubjectMaterialsScreen = (
  subjectId: string,
) => {

  const {
    materials,

    loading,

    error,

    loadMaterials,
  } = useMaterials(
    subjectId,
  );


  // =========================================================
  // SEARCH
  // =========================================================

  const [
    searchText,
    setSearchText,
  ] = useState(
    '',
  );


  // =========================================================
  // FILTER
  // =========================================================

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<
    MaterialFilter
  >(
    'all',
  );


  // =========================================================
  // REFRESH WHEN RETURNING TO SCREEN
  // =========================================================

  const hasFocusedOnce =
    useRef(
      false,
    );


  useFocusEffect(
    useCallback(
      () => {

        if (
          hasFocusedOnce.current
        ) {

          void loadMaterials();

        } else {

          hasFocusedOnce.current =
            true;
        }

      },
      [
        loadMaterials,
      ],
    ),
  );


  // =========================================================
  // FILTERED MATERIALS
  // =========================================================

  const filteredMaterials =
    useMemo(
      () => {

        const query =
          searchText
            .trim()
            .toLowerCase();


        return materials.filter(
          material => {

            // ===============================================
            // SOURCE TYPE
            // ===============================================

            const sourceMatches =

              activeFilter ===
                'all'

              ||

              (
                activeFilter ===
                  'image'

                  ? (
                      material.sourceType ===
                        'image'

                      ||

                      material.sourceType ===
                        'camera'
                    )

                  : material.sourceType ===
                    activeFilter
              );


            if (
              !sourceMatches
            ) {

              return false;
            }


            // ===============================================
            // NO SEARCH
            // ===============================================

            if (!query) {

              return true;
            }


            // ===============================================
            // SEARCH
            // ===============================================

            const titleMatches =
              material.title
                .toLowerCase()
                .includes(
                  query,
                );


            const contentMatches =
              material.content
                ?.toLowerCase()
                .includes(
                  query,
                ) ??
              false;


            const fileNameMatches =
              material.fileName
                ?.toLowerCase()
                .includes(
                  query,
                ) ??
              false;


            return (
              titleMatches
              ||
              contentMatches
              ||
              fileNameMatches
            );
          },
        );

      },
      [
        materials,
        searchText,
        activeFilter,
      ],
    );


  // =========================================================
  // DERIVED STATE
  // =========================================================

  const showLoadError =
    !loading
    &&
    !!error
    &&
    materials.length ===
      0;


  const hasSearch =
    searchText
      .trim()
      .length >
    0;


  const hasActiveFilter =
    activeFilter !==
    'all';


  // =========================================================
  // EMPTY STATE
  // =========================================================

  const emptyTitle =
    useMemo(
      () => {

        if (
          hasSearch
        ) {

          return 'No materials found';
        }


        switch (
          activeFilter
        ) {

          case 'text':

            return 'No text materials yet';


          case 'pdf':

            return 'No PDF materials yet';


          case 'image':

            return 'No image materials yet';


          default:

            return 'Add your first material';
        }

      },
      [
        hasSearch,
        activeFilter,
      ],
    );


  const emptyDescription =
    useMemo(
      () => {

        if (
          hasSearch
        ) {

          return (
            `We couldn't find anything matching `
            + `"${searchText.trim()}".`
          );
        }


        switch (
          activeFilter
        ) {

          case 'text':

            return (
              'This subject does not have '
              + 'any text materials yet.'
            );


          case 'pdf':

            return (
              'This subject does not have '
              + 'any PDF materials yet.'
            );


          case 'image':

            return (
              'This subject does not have '
              + 'any image or camera materials yet.'
            );


          default:

            return (
              'Add text notes, PDFs, gallery images '
              + 'or camera captures.'
            );
        }

      },
      [
        hasSearch,
        activeFilter,
        searchText,
      ],
    );


  // =========================================================
  // RETURN
  // =========================================================

  return {

    // Data
    materials,
    filteredMaterials,

    // Loading
    loading,
    showLoadError,

    // Search
    searchText,
    setSearchText,

    // Filter
    activeFilter,
    setActiveFilter,

    // Empty state
    emptyTitle,
    emptyDescription,
    hasSearch,
    hasActiveFilter,

    // Actions
    loadMaterials,
  };
};