import React, {
  useMemo,
  useState,
} from 'react';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  BookOpen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react-native';

import AccountMenu from '../../components/home/AccountMenu';
import SubjectCard from '../../components/subjects/SubjectCard';

import {Subject} from '../../domain/models/Subject';

import {useAuth} from '../../hooks/useAuth';
import {useSubjects} from '../../hooks/useSubjects';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';

// =========================================================
// Navigation props
// =========================================================

type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'SubjectsHome'
  >;

// =========================================================
// Subject colour palette
// =========================================================

const subjectPalette = [
  {
    background: '#EEF2FF',
    foreground: '#4F46E5',
  },
  {
    background: '#F3E8FF',
    foreground: '#7C3AED',
  },
  {
    background: '#E0F2FE',
    foreground: '#0284C7',
  },
  {
    background: '#DCFCE7',
    foreground: '#16A34A',
  },
  {
    background: '#FEF3C7',
    foreground: '#D97706',
  },
  {
    background: '#FFE4E6',
    foreground: '#E11D48',
  },
];

const SubjectsScreen = ({
  navigation,
}: Props) => {
  const {user} =
    useAuth();

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
  ] = useState('');

  // =========================================================
  // Create / Edit form
  // =========================================================

  const [
    subjectFormVisible,
    setSubjectFormVisible,
  ] = useState(false);

  const [
    editingSubject,
    setEditingSubject,
  ] = useState<
    Subject | null
  >(null);

  const [
    name,
    setName,
  ] = useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  // =========================================================
  // Subject actions
  // =========================================================

  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState<
    Subject | null
  >(null);

  const [
    subjectActionsVisible,
    setSubjectActionsVisible,
  ] = useState(false);

  const displayName =
    user?.name?.trim() ||
    user?.email?.split('@')[0] ||
    'Student';

  // =========================================================
  // Search
  // =========================================================

  const filteredSubjects =
    useMemo(() => {
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
              .includes(query);

          const descriptionMatches =
            subject.description
              ?.toLowerCase()
              .includes(query) ??
            false;

          return (
            nameMatches ||
            descriptionMatches
          );
        },
      );
    }, [
      subjects,
      searchText,
    ]);

  // =========================================================
  // Create subject
  // =========================================================

  const openCreateSubject =
    () => {
      setEditingSubject(null);

      setName('');
      setDescription('');

      setSubjectFormVisible(
        true,
      );
    };

  // =========================================================
  // Subject actions
  // =========================================================

  const openSubjectActions = (
    subject: Subject,
  ) => {
    setSelectedSubject(
      subject,
    );

    setSubjectActionsVisible(
      true,
    );
  };

  const closeSubjectActions =
    () => {
      setSubjectActionsVisible(
        false,
      );

      setSelectedSubject(null);
    };

  // =========================================================
  // Edit subject
  // =========================================================

  const openEditSubject = (
    subject: Subject,
  ) => {
    setSubjectActionsVisible(
      false,
    );

    setSelectedSubject(null);

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
     * Small delay avoids Android
     * closing one Modal and opening
     * another in the same frame.
     */
    setTimeout(() => {
      setSubjectFormVisible(
        true,
      );
    }, 150);
  };

  // =========================================================
  // Close form
  // =========================================================

  const closeSubjectForm =
    () => {
      if (
        creating ||
        updatingSubjectId !==
          null
      ) {
        return;
      }

      setSubjectFormVisible(
        false,
      );

      setEditingSubject(null);

      setName('');
      setDescription('');
    };

  // =========================================================
  // Save subject
  // =========================================================

  const handleSaveSubject =
    async () => {
      const trimmedName =
        name.trim();

      if (!trimmedName) {
        Alert.alert(
          'Subject name required',
          'Please enter a name for your subject.',
        );

        return;
      }

      try {
        if (editingSubject) {
          await updateSubject(
            editingSubject.id,
            trimmedName,
            description.trim() ||
              undefined,
          );
        } else {
          await createSubject(
            trimmedName,
            description.trim() ||
              undefined,
          );
        }

        setSubjectFormVisible(
          false,
        );

        setEditingSubject(null);

        setName('');
        setDescription('');
      } catch (saveError) {
        console.error(
          'Save subject error:',
          saveError,
        );

        Alert.alert(
          editingSubject
            ? 'Unable to update subject'
            : 'Unable to create subject',
          'Something went wrong. Please try again.',
        );
      }
    };

  // =========================================================
  // Delete subject
  // =========================================================

  const confirmDeleteSubject = (
    subject: Subject,
  ) => {
    setSubjectActionsVisible(
      false,
    );

    setSelectedSubject(null);

    setTimeout(() => {
      Alert.alert(
        'Delete Subject',
        `Are you sure you want to delete "${subject.name}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',

            onPress:
              async () => {
                try {
                  await deleteSubject(
                    subject.id,
                  );
                } catch (
                  deleteError
                ) {
                  console.error(
                    'Delete subject error:',
                    deleteError,
                  );

                  Alert.alert(
                    'Unable to delete subject',
                    'Something went wrong while deleting the subject. Please try again.',
                  );
                }
              },
          },
        ],
        {
          cancelable: true,
        },
      );
    }, 150);
  };

  // =========================================================
  // State helpers
  // =========================================================

  const isEditing =
    editingSubject !== null;

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
    subjects.length === 0;

  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

      <View className="flex-1">

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled">

          <View
            className="
              px-6
              pt-6
            ">

            {/* ===========================================
                HEADER
            ============================================ */}

            <View
              className="
                mb-8
                flex-row
                items-center
                justify-between
              ">

              <View
                className="
                  flex-1
                  pr-4
                ">

                <Text
                  className="
                    text-[29px]
                    font-bold
                    tracking-tight
                    text-slate-900
                  ">
                  Subjects
                </Text>

                <Text
                  className="
                    mt-1
                    text-sm
                    leading-5
                    text-slate-500
                  ">
                  Organize everything
                  you're learning.
                </Text>

              </View>

              <AccountMenu
                displayName={
                  displayName
                }
              />

            </View>

            {/* ===========================================
                OVERVIEW
            ============================================ */}

            <View
              className="
                relative
                mb-6
                min-h-[145px]
                flex-row
                items-center
                overflow-hidden
                rounded-[22px]
                bg-indigo-600
                p-6
              ">

              <View
                className="
                  absolute
                  -right-[30px]
                  -top-[45px]
                  h-[115px]
                  w-[115px]
                  rounded-full
                  bg-white/10
                "
              />

              <View
                className="
                  absolute
                  -bottom-10
                  right-8
                  h-[78px]
                  w-[78px]
                  rounded-full
                  bg-white/10
                "
              />

              <View
                className="
                  z-10
                  mr-4
                  h-[52px]
                  w-[52px]
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/15
                ">

                <BookOpen
                  size={23}
                  color="#FFFFFF"
                  strokeWidth={2.1}
                />

              </View>

              <View
                className="
                  z-10
                  flex-1
                ">

                <Text
                  className="
                    text-[10px]
                    font-bold
                    tracking-widest
                    text-indigo-200
                  ">
                  YOUR LEARNING LIBRARY
                </Text>

                <Text
                  className="
                    mt-1
                    text-[32px]
                    font-extrabold
                    text-white
                  ">
                  {subjects.length}
                </Text>

                <Text
                  className="
                    mt-1
                    text-xs
                    leading-[17px]
                    text-indigo-100
                  ">

                  {subjects.length === 1
                    ? 'subject ready for your learning materials'
                    : 'subjects ready for your learning materials'}

                </Text>

              </View>

            </View>

            {/* ===========================================
                SEARCH
            ============================================ */}

            <View
              className="
                mb-8
                h-[54px]
                flex-row
                items-center
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
              ">

              <Search
                size={20}
                color="#64748B"
                strokeWidth={2}
              />

              <TextInput
                className="
                  ml-2
                  flex-1
                  py-0
                  text-sm
                  text-slate-900
                "
                placeholder="Search your subjects..."
                placeholderTextColor="#94A3B8"
                value={
                  searchText
                }
                onChangeText={
                  setSearchText
                }
                returnKeyType="search"
              />

              {searchText.length >
                0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  hitSlop={10}
                  onPress={() =>
                    setSearchText('')
                  }
                  className="
                    h-[30px]
                    w-[30px]
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                    active:opacity-70
                  ">

                  <X
                    size={17}
                    color="#64748B"
                  />

                </Pressable>
              )}

            </View>

            {/* ===========================================
                SECTION HEADER
            ============================================ */}

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
                    justify-center
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

            {/* ===========================================
                LOADING
            ============================================ */}

            {loading ? (
              <View
                className="
                  min-h-[270px]
                  items-center
                  justify-center
                  px-8
                ">

                <View
                  className="
                    mb-4
                    h-[54px]
                    w-[54px]
                    items-center
                    justify-center
                    rounded-[17px]
                    bg-indigo-50
                  ">

                  <ActivityIndicator
                    size="small"
                    color="#4F46E5"
                  />

                </View>

                <Text
                  className="
                    text-center
                    text-lg
                    font-bold
                    text-slate-900
                  ">
                  Loading your
                  subjects
                </Text>

                <Text
                  className="
                    mt-2
                    max-w-[280px]
                    text-center
                    text-sm
                    leading-[19px]
                    text-slate-500
                  ">
                  Preparing your
                  learning library...
                </Text>

              </View>
            ) : showLoadError ? (

              /* =========================================
                  ERROR
              ========================================== */

              <View
                className="
                  min-h-[270px]
                  items-center
                  justify-center
                  px-8
                ">

                <View
                  className="
                    mb-4
                    h-[54px]
                    w-[54px]
                    items-center
                    justify-center
                    rounded-[17px]
                    bg-red-50
                  ">

                  <RefreshCw
                    size={26}
                    color="#DC2626"
                  />

                </View>

                <Text
                  className="
                    text-center
                    text-lg
                    font-bold
                    text-slate-900
                  ">
                  Couldn't load
                  subjects
                </Text>

                <Text
                  className="
                    mt-2
                    max-w-[280px]
                    text-center
                    text-sm
                    leading-[19px]
                    text-slate-500
                  ">
                  Check your connection
                  and try again.
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={
                    loadSubjects
                  }
                  className="
                    mt-6
                    flex-row
                    items-center
                    rounded-xl
                    bg-indigo-50
                    px-6
                    py-3
                    active:scale-[0.98]
                    active:opacity-80
                  ">

                  <RefreshCw
                    size={17}
                    color="#4F46E5"
                  />

                  <Text
                    className="
                      ml-2
                      text-sm
                      font-bold
                      text-indigo-600
                    ">
                    Try again
                  </Text>

                </Pressable>

              </View>
            ) :
            filteredSubjects.length ===
              0 ? (

              /* =========================================
                  EMPTY
              ========================================== */

              <View
                className="
                  min-h-[300px]
                  items-center
                  justify-center
                  px-8
                ">

                <View
                  className="
                    mb-6
                    h-[86px]
                    w-[86px]
                    items-center
                    justify-center
                    rounded-[28px]
                    bg-purple-50
                  ">

                  <View
                    className="
                      h-[58px]
                      w-[58px]
                      items-center
                      justify-center
                      rounded-[19px]
                      bg-indigo-50
                    ">

                    {searchText.trim()
                      ? (
                        <Search
                          size={30}
                          color="#4F46E5"
                        />
                      )
                      : (
                        <BookOpen
                          size={30}
                          color="#4F46E5"
                        />
                      )}

                  </View>

                </View>

                <Text
                  className="
                    text-center
                    text-xl
                    font-bold
                    text-slate-900
                  ">

                  {searchText.trim()
                    ? 'No subjects found'
                    : 'Create your first subject'}

                </Text>

                <Text
                  className="
                    mt-2
                    max-w-[300px]
                    text-center
                    text-sm
                    leading-5
                    text-slate-500
                  ">

                  {searchText.trim()
                    ? `We couldn't find anything matching "${searchText.trim()}".`
                    : 'Subjects help you organize notes, PDFs, images and other learning materials.'}

                </Text>

                {!searchText.trim() && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={
                      openCreateSubject
                    }
                    className="
                      mt-6
                      flex-row
                      items-center
                      rounded-2xl
                      bg-indigo-600
                      px-6
                      py-3
                      active:scale-[0.98]
                      active:opacity-80
                    ">

                    <Plus
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text
                      className="
                        ml-2
                        text-sm
                        font-bold
                        text-white
                      ">
                      Add subject
                    </Text>

                  </Pressable>
                )}

              </View>
            ) : (

              /* =========================================
                  SUBJECT LIST
              ========================================== */

              <View>

                {filteredSubjects.map(
                  (
                    subject,
                    index,
                  ) => {
                    const accent =
                      subjectPalette[
                        index %
                          subjectPalette.length
                      ];

                    const busy =
                      updatingSubjectId ===
                        subject.id ||
                      deletingSubjectId ===
                        subject.id;

                    return (
                      <SubjectCard
                        key={
                          subject.id
                        }
                        subject={
                          subject
                        }
                        accent={
                          accent
                        }
                        busy={
                          busy
                        }

                        /*
                         * Open the selected
                         * subject's Materials.
                         */
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
                          openSubjectActions
                        }
                      />
                    );
                  },
                )}

              </View>
            )}

            <View className="h-[100px]" />

          </View>

        </ScrollView>

        {/* =============================================
            FLOATING ADD
        ============================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add subject"
          onPress={
            openCreateSubject
          }
          className="
            absolute
            bottom-6
            right-6
            h-[62px]
            w-[62px]
            items-center
            justify-center
            rounded-[20px]
            bg-indigo-600
            shadow-lg
            active:scale-95
            active:opacity-80
          ">

          <Plus
            size={28}
            color="#FFFFFF"
            strokeWidth={2.2}
          />

        </Pressable>

      </View>

      {/* =====================================================
          SUBJECT ACTIONS
      ====================================================== */}

      <Modal
        transparent
        animationType="fade"
        visible={
          subjectActionsVisible
        }
        statusBarTranslucent
        onRequestClose={
          closeSubjectActions
        }>

        <Pressable
          className="
            flex-1
            justify-end
            bg-slate-900/50
          "
          onPress={
            closeSubjectActions
          }>

          <Pressable
            className="
              rounded-t-[26px]
              bg-white
              px-6
              pb-8
              pt-2
            "
            onPress={event =>
              event.stopPropagation()
            }>

            <View
              className="
                mb-6
                h-[5px]
                w-[42px]
                self-center
                rounded-full
                bg-slate-200
              "
            />

            <Text
              className="
                text-xl
                font-bold
                text-slate-900
              "
              numberOfLines={1}>
              {
                selectedSubject?.name
              }
            </Text>

            <Text
              className="
                mt-1
                text-sm
                text-slate-500
              ">
              Manage this subject
            </Text>

            <View
              className="
                my-4
                h-px
                bg-slate-200
              "
            />

            {/* Edit */}

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (
                  selectedSubject
                ) {
                  openEditSubject(
                    selectedSubject,
                  );
                }
              }}
              className="
                min-h-[72px]
                flex-row
                items-center
                rounded-2xl
                px-2
                py-2
                active:bg-indigo-50
              ">

              <View
                className="
                  mr-4
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-[13px]
                  bg-indigo-50
                ">

                <Pencil
                  size={20}
                  color="#4F46E5"
                />

              </View>

              <View className="flex-1">

                <Text
                  className="
                    text-base
                    font-bold
                    text-slate-900
                  ">
                  Edit subject
                </Text>

                <Text
                  className="
                    mt-1
                    text-xs
                    leading-[17px]
                    text-slate-500
                  ">
                  Change the name or
                  description
                </Text>

              </View>

            </Pressable>

            {/* Delete */}

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (
                  selectedSubject
                ) {
                  confirmDeleteSubject(
                    selectedSubject,
                  );
                }
              }}
              className="
                min-h-[72px]
                flex-row
                items-center
                rounded-2xl
                px-2
                py-2
                active:bg-red-50
              ">

              <View
                className="
                  mr-4
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-[13px]
                  bg-red-50
                ">

                <Trash2
                  size={20}
                  color="#DC2626"
                />

              </View>

              <View className="flex-1">

                <Text
                  className="
                    text-base
                    font-bold
                    text-red-600
                  ">
                  Delete subject
                </Text>

                <Text
                  className="
                    mt-1
                    text-xs
                    leading-[17px]
                    text-slate-500
                  ">
                  Permanently remove
                  this subject
                </Text>

              </View>

            </Pressable>

          </Pressable>

        </Pressable>

      </Modal>

      {/* =====================================================
          CREATE / EDIT FORM
      ====================================================== */}

      <Modal
        transparent
        animationType="fade"
        visible={
          subjectFormVisible
        }
        statusBarTranslucent
        onRequestClose={
          closeSubjectForm
        }>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }>

          <Pressable
            className="
              flex-1
              justify-center
              bg-slate-900/50
              px-6
            "
            onPress={
              closeSubjectForm
            }>

            <Pressable
              className="
                w-full
                self-center
                rounded-3xl
                bg-white
                p-6
              "
              onPress={event =>
                event.stopPropagation()
              }>

              <View
                className="
                  mb-4
                  h-[52px]
                  w-[52px]
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                ">

                {isEditing ? (
                  <Pencil
                    size={23}
                    color="#4F46E5"
                  />
                ) : (
                  <Sparkles
                    size={24}
                    color="#4F46E5"
                  />
                )}

              </View>

              <Text
                className="
                  text-[22px]
                  font-bold
                  tracking-tight
                  text-slate-900
                ">

                {isEditing
                  ? 'Edit subject'
                  : 'Create a subject'}

              </Text>

              <Text
                className="
                  mb-6
                  mt-1
                  text-sm
                  leading-5
                  text-slate-500
                ">

                {isEditing
                  ? 'Update the details of your learning subject.'
                  : 'Create a learning space for your materials and AI study tools.'}

              </Text>

              {/* Name */}

              <Text
                className="
                  mb-2
                  text-sm
                  font-semibold
                  text-slate-900
                ">
                Subject name
              </Text>

              <TextInput
                className="
                  mb-4
                  min-h-[52px]
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  text-slate-900
                "
                placeholder="e.g. Operating Systems"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={
                  setName
                }
                editable={
                  !submitting
                }
                autoFocus
                maxLength={80}
              />

              {/* Description */}

              <Text
                className="
                  mb-2
                  text-sm
                  font-semibold
                  text-slate-900
                ">
                Description

                <Text
                  className="
                    font-normal
                    text-slate-400
                  ">
                  {' '}optional
                </Text>

              </Text>

              <TextInput
                className="
                  min-h-[100px]
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-4
                  text-sm
                  text-slate-900
                "
                placeholder="What will you study here?"
                placeholderTextColor="#94A3B8"
                value={
                  description
                }
                onChangeText={
                  setDescription
                }
                editable={
                  !submitting
                }
                multiline
                maxLength={200}
                textAlignVertical="top"
              />

              <Text
                className="
                  mb-6
                  mt-1
                  self-end
                  text-xs
                  text-slate-400
                ">
                {
                  description.length
                }/200
              </Text>

              {/* Actions */}

              <View
                className="
                  flex-row
                  justify-end
                ">

                <Pressable
                  disabled={
                    submitting
                  }
                  onPress={
                    closeSubjectForm
                  }
                  className="
                    mr-2
                    min-h-[48px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-6
                    active:bg-slate-100
                  ">

                  <Text
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                    ">
                    Cancel
                  </Text>

                </Pressable>

                <Pressable
                  disabled={
                    submitting ||
                    !name.trim()
                  }
                  onPress={
                    handleSaveSubject
                  }
                  className="
                    min-h-[48px]
                    min-w-[145px]
                    flex-row
                    items-center
                    justify-center
                    rounded-xl
                    bg-indigo-600
                    px-6
                  "
                  style={({pressed}) => ({
                    opacity:
                      submitting ||
                      !name.trim()
                        ? 0.4
                        : pressed
                          ? 0.8
                          : 1,

                    transform: [
                      {
                        scale:
                          !submitting &&
                          !!name.trim() &&
                          pressed
                            ? 0.98
                            : 1,
                      },
                    ],
                  })}>

                  {submitting ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      {isEditing ? (
                        <Pencil
                          size={17}
                          color="#FFFFFF"
                        />
                      ) : (
                        <Plus
                          size={18}
                          color="#FFFFFF"
                        />
                      )}

                      <Text
                        className="
                          ml-2
                          text-sm
                          font-bold
                          text-white
                        ">

                        {isEditing
                          ? 'Save changes'
                          : 'Create subject'}

                      </Text>
                    </>
                  )}

                </Pressable>

              </View>

            </Pressable>

          </Pressable>

        </KeyboardAvoidingView>

      </Modal>

    </SafeAreaView>
  );
};

export default SubjectsScreen;
