import React, {
  useMemo,
  useState,
} from 'react';

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

import {subjectStyles as styles} from './styles/subjectStyles';

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

const SubjectsScreen = () => {
  const {user} = useAuth();

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

  const [searchText, setSearchText] =
    useState('');

  /*
   * Create / Edit form
   */
  const [
    subjectFormVisible,
    setSubjectFormVisible,
  ] = useState(false);

  const [
    editingSubject,
    setEditingSubject,
  ] = useState<Subject | null>(null);

  const [name, setName] =
    useState('');

  const [description, setDescription] =
    useState('');

  /*
   * Subject options bottom sheet
   */
  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState<Subject | null>(null);

  const [
    subjectActionsVisible,
    setSubjectActionsVisible,
  ] = useState(false);

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Student';

  /*
   * Search
   */
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
    }, [subjects, searchText]);

  /*
   * Create subject
   */
  const openCreateSubject = () => {
    setEditingSubject(null);

    setName('');
    setDescription('');

    setSubjectFormVisible(true);
  };

  /*
   * Subject options
   */
  const openSubjectActions = (
    subject: Subject,
  ) => {
    setSelectedSubject(subject);

    setSubjectActionsVisible(true);
  };

  const closeSubjectActions = () => {
    setSubjectActionsVisible(false);
    setSelectedSubject(null);
  };

  /*
   * Edit subject
   */
  const openEditSubject = (
    subject: Subject,
  ) => {
    setSubjectActionsVisible(false);

    setSelectedSubject(null);

    setEditingSubject(subject);

    setName(subject.name);

    setDescription(
      subject.description ?? '',
    );

    /*
     * Small delay avoids Android trying
     * to close one Modal and open another
     * during the exact same frame.
     */
    setTimeout(() => {
      setSubjectFormVisible(true);
    }, 150);
  };

  /*
   * Close create/edit modal
   */
  const closeSubjectForm = () => {
    if (
      creating ||
      updatingSubjectId !== null
    ) {
      return;
    }

    setSubjectFormVisible(false);

    setEditingSubject(null);

    setName('');
    setDescription('');
  };

  /*
   * Create OR Update
   */
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

        setSubjectFormVisible(false);

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

  /*
   * Delete subject
   */
  const confirmDeleteSubject = (
    subject: Subject,
  ) => {
    setSubjectActionsVisible(false);

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

            onPress: async () => {
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

  const isEditing =
    editingSubject !== null;

  const submitting =
    creating ||
    (editingSubject !== null &&
      updatingSubjectId ===
        editingSubject.id);

  const showLoadError =
    !loading &&
    !!error &&
    subjects.length === 0;

  return (
    <SafeAreaView
      style={styles.safeArea}>

      <View style={styles.screen}>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled">

          {/* Header */}

          <View style={styles.header}>

            <View
              style={
                styles.headerTextContainer
              }>

              <Text
                style={styles.headerTitle}>
                Subjects
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }>
                Organize everything
                you're learning.
              </Text>

            </View>

            <AccountMenu
              displayName={displayName}
            />

          </View>

          {/* Overview */}

          <View
            style={styles.overviewCard}>

            <View
              style={
                styles.overviewDecorationOne
              }
            />

            <View
              style={
                styles.overviewDecorationTwo
              }
            />

            <View
              style={styles.overviewIcon}>

              <BookOpen
                size={23}
                color="#FFFFFF"
                strokeWidth={2.1}
              />

            </View>

            <View
              style={
                styles.overviewContent
              }>

              <Text
                style={
                  styles.overviewLabel
                }>
                YOUR LEARNING LIBRARY
              </Text>

              <Text
                style={
                  styles.overviewNumber
                }>
                {subjects.length}
              </Text>

              <Text
                style={
                  styles.overviewDescription
                }>

                {subjects.length === 1
                  ? 'subject ready for your learning materials'
                  : 'subjects ready for your learning materials'}

              </Text>

            </View>

          </View>

          {/* Search */}

          <View
            style={
              styles.searchContainer
            }>

            <Search
              size={20}
              color="#64748B"
              strokeWidth={2}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Search your subjects..."
              placeholderTextColor="#94A3B8"
              value={searchText}
              onChangeText={
                setSearchText
              }
              returnKeyType="search"
            />

            {searchText.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={10}
                onPress={() =>
                  setSearchText('')
                }
                style={({pressed}) => [
                  styles.clearSearchButton,

                  pressed &&
                    styles.clearSearchPressed,
                ]}>

                <X
                  size={17}
                  color="#64748B"
                />

              </Pressable>
            )}

          </View>

          {/* Section heading */}

          <View
            style={styles.sectionHeader}>

            <Text
              style={styles.sectionTitle}>
              Your subjects
            </Text>

            {!loading && (
              <View
                style={
                  styles.countBadge
                }>

                <Text
                  style={
                    styles.countBadgeText
                  }>
                  {
                    filteredSubjects.length
                  }
                </Text>

              </View>
            )}

          </View>

          {/* Loading */}

          {loading ? (
            <View
              style={
                styles.stateContainer
              }>

              <View
                style={
                  styles.loadingIcon
                }>

                <ActivityIndicator
                  size="small"
                  color="#4F46E5"
                />

              </View>

              <Text
                style={styles.stateTitle}>
                Loading your subjects
              </Text>

              <Text
                style={
                  styles.stateDescription
                }>
                Preparing your learning
                library...
              </Text>

            </View>
          ) : showLoadError ? (

            /* Error */

            <View
              style={
                styles.stateContainer
              }>

              <View
                style={
                  styles.errorIcon
                }>

                <RefreshCw
                  size={26}
                  color="#DC2626"
                />

              </View>

              <Text
                style={styles.stateTitle}>
                Couldn't load subjects
              </Text>

              <Text
                style={
                  styles.stateDescription
                }>
                Check your connection
                and try again.
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={loadSubjects}
                style={({pressed}) => [
                  styles.retryButton,

                  pressed &&
                    styles.buttonPressed,
                ]}>

                <RefreshCw
                  size={17}
                  color="#4F46E5"
                />

                <Text
                  style={
                    styles.retryButtonText
                  }>
                  Try again
                </Text>

              </Pressable>

            </View>
          ) : filteredSubjects.length ===
            0 ? (

            /* Empty */

            <View
              style={styles.emptyState}>

              <View
                style={
                  styles.emptyIconOuter
                }>

                <View
                  style={
                    styles.emptyIconInner
                  }>

                  {searchText.trim() ? (
                    <Search
                      size={30}
                      color="#4F46E5"
                    />
                  ) : (
                    <BookOpen
                      size={30}
                      color="#4F46E5"
                    />
                  )}

                </View>

              </View>

              <Text
                style={styles.emptyTitle}>

                {searchText.trim()
                  ? 'No subjects found'
                  : 'Create your first subject'}

              </Text>

              <Text
                style={
                  styles.emptyDescription
                }>

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
                  style={({pressed}) => [
                    styles.emptyButton,

                    pressed &&
                      styles.buttonPressed,
                  ]}>

                  <Plus
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.emptyButtonText
                    }>
                    Add subject
                  </Text>

                </Pressable>
              )}

            </View>
          ) : (

            /* Subject list */

            <View>

              {filteredSubjects.map(
                (subject, index) => {

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
                      key={subject.id}
                      subject={subject}
                      accent={accent}
                      busy={busy}
                      onOptionsPress={
                        openSubjectActions
                      }
                    />
                  );
                },
              )}

            </View>
          )}

          <View
            style={styles.bottomSpace}
          />

        </ScrollView>

        {/* Floating add */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add subject"
          onPress={openCreateSubject}
          style={({pressed}) => [
            styles.floatingButton,

            pressed &&
              styles.floatingButtonPressed,
          ]}>

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
          style={
            styles.actionModalOverlay
          }
          onPress={
            closeSubjectActions
          }>

          <Pressable
            style={
              styles.actionSheet
            }
            onPress={event =>
              event.stopPropagation()
            }>

            <View
              style={
                styles.actionSheetHandle
              }
            />

            <Text
              style={
                styles.actionSheetTitle
              }
              numberOfLines={1}>
              {selectedSubject?.name}
            </Text>

            <Text
              style={
                styles.actionSheetSubtitle
              }>
              Manage this subject
            </Text>

            <View
              style={
                styles.actionDivider
              }
            />

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
              style={({pressed}) => [
                styles.actionItem,

                pressed &&
                  styles.actionItemPressed,
              ]}>

              <View
                style={
                  styles.editActionIcon
                }>

                <Pencil
                  size={20}
                  color="#4F46E5"
                />

              </View>

              <View
                style={
                  styles.actionItemContent
                }>

                <Text
                  style={
                    styles.actionItemTitle
                  }>
                  Edit subject
                </Text>

                <Text
                  style={
                    styles.actionItemDescription
                  }>
                  Change the name or
                  description
                </Text>

              </View>

            </Pressable>

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
              style={({pressed}) => [
                styles.actionItem,

                pressed &&
                  styles.deleteActionPressed,
              ]}>

              <View
                style={
                  styles.deleteActionIcon
                }>

                <Trash2
                  size={20}
                  color="#DC2626"
                />

              </View>

              <View
                style={
                  styles.actionItemContent
                }>

                <Text
                  style={
                    styles.deleteActionTitle
                  }>
                  Delete subject
                </Text>

                <Text
                  style={
                    styles.actionItemDescription
                  }>
                  Permanently remove this
                  subject
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
        visible={subjectFormVisible}
        statusBarTranslucent
        onRequestClose={
          closeSubjectForm
        }>

        <KeyboardAvoidingView
          style={
            styles.modalKeyboardView
          }
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }>

          <Pressable
            style={styles.modalOverlay}
            onPress={
              closeSubjectForm
            }>

            <Pressable
              style={styles.modalCard}
              onPress={event =>
                event.stopPropagation()
              }>

              <View
                style={styles.modalIcon}>

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
                style={styles.modalTitle}>

                {isEditing
                  ? 'Edit subject'
                  : 'Create a subject'}

              </Text>

              <Text
                style={
                  styles.modalSubtitle
                }>

                {isEditing
                  ? 'Update the details of your learning subject.'
                  : 'Create a learning space for your materials and AI study tools.'}

              </Text>

              {/* Name */}

              <Text
                style={styles.inputLabel}>
                Subject name
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Operating Systems"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                editable={!submitting}
                autoFocus
                maxLength={80}
              />

              {/* Description */}

              <Text
                style={styles.inputLabel}>

                Description

                <Text
                  style={
                    styles.optionalText
                  }>
                  {' '}optional
                </Text>

              </Text>

              <TextInput
                style={[
                  styles.modalInput,
                  styles.descriptionInput,
                ]}
                placeholder="What will you study here?"
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={
                  setDescription
                }
                editable={!submitting}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />

              <Text
                style={
                  styles.characterCount
                }>
                {description.length}/200
              </Text>

              {/* Actions */}

              <View
                style={
                  styles.modalActions
                }>

                <Pressable
                  disabled={submitting}
                  onPress={
                    closeSubjectForm
                  }
                  style={({pressed}) => [
                    styles.cancelButton,

                    pressed &&
                      styles.secondaryPressed,
                  ]}>

                  <Text
                    style={
                      styles.cancelButtonText
                    }>
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
                  style={({pressed}) => [
                    styles.createButton,

                    (submitting ||
                      !name.trim()) &&
                      styles.createButtonDisabled,

                    pressed &&
                      !submitting &&
                      !!name.trim() &&
                      styles.buttonPressed,
                  ]}>

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
                        style={
                          styles.createButtonText
                        }>

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