import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
} from 'react-native';

import {
  Subject,
} from '../domain/models/Subject';

import {
  useAuth,
} from './useAuth';

import {
  useSubjects,
} from './useSubjects';

import {
  getDisplayName,
} from '../utils/userUtils';


export const useSubjectsScreen = () => {

  const {
    user,
  } = useAuth();


  const {
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
  } = useSubjects();


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
  // SUBJECT FORM
  // =========================================================

  const [
    formVisible,
    setFormVisible,
  ] = useState(
    false,
  );


  const [
    editingSubject,
    setEditingSubject,
  ] = useState<
    Subject | null
  >(null);


  const [
    name,
    setName,
  ] = useState(
    '',
  );


  const [
    description,
    setDescription,
  ] = useState(
    '',
  );


  // =========================================================
  // ACTION SHEET
  // =========================================================

  const [
    actionsVisible,
    setActionsVisible,
  ] = useState(
    false,
  );


  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState<
    Subject | null
  >(null);


  // =========================================================
  // DERIVED VALUES
  // =========================================================

  const displayName =
    getDisplayName(
      user,
    );


  const filteredSubjects =
    useMemo(
      () => {

        const query =
          searchText
            .trim()
            .toLowerCase();


        if (!query) {

          return subjects;
        }


        return subjects.filter(
          subject => {

            const nameMatches =
              subject.name
                .toLowerCase()
                .includes(
                  query,
                );


            const descriptionMatches =
              subject.description
                ?.toLowerCase()
                .includes(
                  query,
                ) ??
              false;


            return (
              nameMatches ||
              descriptionMatches
            );
          },
        );

      },
      [
        subjects,
        searchText,
      ],
    );


  const submitting =
    creating ||
    (
      editingSubject !== null &&
      updatingSubjectId ===
        editingSubject.id
    );


  const showLoadError =
    !loading &&
    !!error &&
    subjects.length ===
      0;


  // =========================================================
  // FORM HELPERS
  // =========================================================

  const resetForm =
    useCallback(
      () => {

        setEditingSubject(
          null,
        );


        setName(
          '',
        );


        setDescription(
          '',
        );
      },
      [],
    );


  const openCreateSubject =
    useCallback(
      () => {

        resetForm();


        setFormVisible(
          true,
        );
      },
      [
        resetForm,
      ],
    );


  const closeForm =
    useCallback(
      () => {

        if (submitting) {

          return;
        }


        setFormVisible(
          false,
        );


        resetForm();
      },
      [
        submitting,
        resetForm,
      ],
    );


  // =========================================================
  // ACTION SHEET
  // =========================================================

  const openActions =
    useCallback(
      (
        subject:
          Subject,
      ) => {

        setSelectedSubject(
          subject,
        );


        setActionsVisible(
          true,
        );
      },
      [],
    );


  const closeActions =
    useCallback(
      () => {

        setActionsVisible(
          false,
        );


        setSelectedSubject(
          null,
        );
      },
      [],
    );


  // =========================================================
  // EDIT
  // =========================================================

  const openEdit =
    useCallback(
      (
        subject:
          Subject,
      ) => {

        closeActions();


        setEditingSubject(
          subject,
        );


        setName(
          subject.name,
        );


        setDescription(
          subject.description ??
          '',
        );


        /*
         * Give the actions sheet enough
         * time to close before opening
         * the form modal.
         */
        setTimeout(
          () => {

            setFormVisible(
              true,
            );

          },
          150,
        );
      },
      [
        closeActions,
      ],
    );


  // =========================================================
  // SAVE
  // =========================================================

  const saveSubject =
    useCallback(
      async () => {

        const cleanName =
          name.trim();


        const cleanDescription =
          description
            .trim();


        if (!cleanName) {

          Alert.alert(
            'Subject name required',

            'Please enter a name for your subject.',
          );


          return;
        }


        try {

          if (
            editingSubject
          ) {

            await updateSubject(
              editingSubject.id,

              cleanName,

              cleanDescription ||
              undefined,
            );

          } else {

            await createSubject(
              cleanName,

              cleanDescription ||
              undefined,
            );
          }


          setFormVisible(
            false,
          );


          resetForm();

        } catch (
          saveError
        ) {

          Alert.alert(
            editingSubject
              ? 'Unable to update subject'
              : 'Unable to create subject',

            saveError instanceof Error
              ? saveError.message
              : 'Something went wrong. Please try again.',
          );
        }
      },
      [
        name,
        description,
        editingSubject,
        updateSubject,
        createSubject,
        resetForm,
      ],
    );


  // =========================================================
  // DELETE
  // =========================================================

  const confirmDelete =
    useCallback(
      (
        subject:
          Subject,
      ) => {

        closeActions();


        setTimeout(
          () => {

            Alert.alert(
              'Delete Subject',

              `Are you sure you want to delete "${subject.name}"?`,

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

                        await deleteSubject(
                          subject.id,
                        );

                      } catch (
                        deleteError
                      ) {

                        Alert.alert(
                          'Unable to delete subject',

                          deleteError instanceof Error
                            ? deleteError.message
                            : 'Something went wrong while deleting the subject.',
                        );
                      }
                    },
                },
              ],
            );

          },
          150,
        );
      },
      [
        closeActions,
        deleteSubject,
      ],
    );


  // =========================================================
  // BUSY CHECK
  // =========================================================

  const isSubjectBusy =
    useCallback(
      (
        subjectId:
          string,
      ) => {

        return (
          updatingSubjectId ===
            subjectId
          ||
          deletingSubjectId ===
            subjectId
        );
      },
      [
        updatingSubjectId,
        deletingSubjectId,
      ],
    );


  // =========================================================
  // RETURN
  // =========================================================

  return {

    // Data
    subjects,
    filteredSubjects,

    // User
    displayName,

    // Loading
    loading,
    showLoadError,

    // Search
    searchText,
    setSearchText,

    // Form
    formVisible,
    editingSubject,
    name,
    description,
    submitting,

    setName,
    setDescription,

    openCreateSubject,
    closeForm,
    openEdit,
    saveSubject,

    // Actions
    actionsVisible,
    selectedSubject,

    openActions,
    closeActions,
    confirmDelete,

    // Utilities
    loadSubjects,
    isSubjectBusy,
  };
};