import React, {
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  BookOpen,
  RefreshCw,
  Search,
} from 'lucide-react-native';

import BottomActionBar
  from '../../components/common/BottomActionBar';

import OverviewCard
  from '../../components/common/OverviewCard';

import ScreenHeader
  from '../../components/common/ScreenHeader';

import ScreenState
  from '../../components/common/ScreenState';

import SearchBar
  from '../../components/common/SearchBar';

import AccountMenu
  from '../../components/home/AccountMenu';

import SubjectActionsSheet
  from '../../components/subjects/SubjectActionsSheet';

import SubjectCard
  from '../../components/subjects/SubjectCard';

import SubjectFormModal
  from '../../components/subjects/SubjectFormModal';

import {
  subjectPalette,
} from '../../constants/subjectPalette';

import {
  Subject,
} from '../../domain/models/Subject';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  useSubjects,
} from '../../hooks/useSubjects';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';

import {
  getDisplayName,
} from '../../utils/userUtils';


type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'SubjectsHome'
  >;


const SubjectsScreen = ({
  navigation,
}: Props) => {

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


  const [
    searchText,
    setSearchText,
  ] = useState(
    '',
  );


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
    selectedSubject,
    setSelectedSubject,
  ] = useState<
    Subject | null
  >(null);


  const [
    actionsVisible,
    setActionsVisible,
  ] = useState(
    false,
  );


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
          subject =>

            subject.name
              .toLowerCase()
              .includes(
                query,
              )

            ||

            (
              subject.description
                ?.toLowerCase()
                .includes(
                  query,
                )
              ??
              false
            ),
        );

      },
      [
        subjects,
        searchText,
      ],
    );


  const submitting =

    creating

    ||

    (
      editingSubject !==
        null

      &&

      updatingSubjectId ===
        editingSubject.id
    );


  const showLoadError =

    !loading

    &&

    !!error

    &&

    subjects.length === 0;


  // =========================================================
  // FORM
  // =========================================================

  const resetForm =
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
    };


  const openCreateSubject =
    () => {

      resetForm();


      setFormVisible(
        true,
      );
    };


  const closeForm =
    () => {

      if (submitting) {
        return;
      }


      setFormVisible(
        false,
      );


      resetForm();
    };


  // =========================================================
  // ACTION SHEET
  // =========================================================

  const openActions =
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
    };


  const closeActions =
    () => {

      setActionsVisible(
        false,
      );


      setSelectedSubject(
        null,
      );
    };


  const openEdit =
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


      setTimeout(
        () => {

          setFormVisible(
            true,
          );

        },
        150,
      );
    };


  // =========================================================
  // SAVE
  // =========================================================

  const saveSubject =
    async () => {

      const cleanName =
        name.trim();


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

            description
              .trim() ||
            undefined,
          );

        } else {

          await createSubject(
            cleanName,

            description
              .trim() ||
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
    };


  // =========================================================
  // DELETE
  // =========================================================

  const confirmDelete =
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
    };


  // =========================================================
  // UI
  // =========================================================

  return (

    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

      <View
        className="
          flex-1
        ">

        <ScrollView
          className="
            flex-1
          "

          showsVerticalScrollIndicator={
            false
          }

          keyboardShouldPersistTaps="handled">

          <View
            className="
              px-6
              pb-6
              pt-6
            ">

            <ScreenHeader
              title="Subjects"

              subtitle="Organize everything you're learning."

              right={
                <AccountMenu
                  displayName={
                    displayName
                  }
                />
              }
            />


            <View
              className="
                mb-6
              ">

              <OverviewCard
                kicker="YOUR LEARNING LIBRARY"

                value={
                  subjects.length
                }

                description={
                  subjects.length === 1
                    ? 'subject ready for your learning materials'
                    : 'subjects ready for your learning materials'
                }

                icon={
                  BookOpen
                }
              />

            </View>


            <View
              className="
                mb-8
              ">

              <SearchBar
                value={
                  searchText
                }

                onChangeText={
                  setSearchText
                }

                placeholder="Search your subjects..."
              />

            </View>


            <View
              className="
                mb-4
                flex-row
                items-center
              ">

              <Text
                className="
                  text-lg
                  font-bold
                  text-slate-900
                ">

                Your subjects

              </Text>


              {!loading && (

                <View
                  className="
                    ml-2
                    min-w-[28px]
                    items-center
                    rounded-full
                    bg-indigo-50
                    px-2
                    py-1
                  ">

                  <Text
                    className="
                      text-xs
                      font-bold
                      text-indigo-600
                    ">

                    {
                      filteredSubjects.length
                    }

                  </Text>

                </View>

              )}

            </View>


            {loading ? (

              <ScreenState
                loading

                title="Loading your subjects"

                description="Preparing your learning library..."
              />

            ) : showLoadError ? (

              <ScreenState
                title="Couldn't load subjects"

                description="Check your connection and try again."

                icon={
                  RefreshCw
                }

                iconColor="#DC2626"

                actionTitle="Try again"

                onAction={
                  loadSubjects
                }
              />

            ) : filteredSubjects.length ===
              0 ? (

              <ScreenState
                title={
                  searchText.trim()
                    ? 'No subjects found'
                    : 'Create your first subject'
                }

                description={
                  searchText.trim()
                    ? `We couldn't find anything matching "${searchText.trim()}".`
                    : 'Subjects help you organize notes, PDFs, images and other learning materials.'
                }

                icon={
                  searchText.trim()
                    ? Search
                    : BookOpen
                }
              />

            ) : (

              <View>

                {filteredSubjects.map(
                  (
                    subject,
                    index,
                  ) => (

                    <SubjectCard
                      key={
                        subject.id
                      }

                      subject={
                        subject
                      }

                      accent={
                        subjectPalette[
                          index %
                          subjectPalette.length
                        ]
                      }

                      busy={
                        updatingSubjectId ===
                          subject.id

                        ||

                        deletingSubjectId ===
                          subject.id
                      }

                      onPress={() =>

                        navigation.navigate(
                          'SubjectMaterials',

                          {
                            subjectId:
                              subject.id,

                            subjectName:
                              subject.name,
                          },
                        )
                      }

                      onOptionsPress={
                        openActions
                      }
                    />

                  ),
                )}

              </View>

            )}

          </View>

        </ScrollView>


        <BottomActionBar
          title="Add subject"

          onPress={
            openCreateSubject
          }
        />

      </View>


      <SubjectActionsSheet
        visible={
          actionsVisible
        }

        subject={
          selectedSubject
        }

        onClose={
          closeActions
        }

        onEdit={
          openEdit
        }

        onDelete={
          confirmDelete
        }
      />


      <SubjectFormModal
        visible={
          formVisible
        }

        editing={
          editingSubject !==
          null
        }

        name={
          name
        }

        description={
          description
        }

        submitting={
          submitting
        }

        onNameChange={
          setName
        }

        onDescriptionChange={
          setDescription
        }

        onClose={
          closeForm
        }

        onSave={
          saveSubject
        }
      />

    </SafeAreaView>
  );
};


export default SubjectsScreen;