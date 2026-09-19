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
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react-native';

import AccountMenu from '../../components/home/AccountMenu';
import SubjectCard from '../../components/subjects/SubjectCard';

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
    error,
    loadSubjects,
    createSubject,
  } = useSubjects();

  const [searchText, setSearchText] =
    useState('');

  const [
    addModalVisible,
    setAddModalVisible,
  ] = useState(false);

  const [name, setName] =
    useState('');

  const [description, setDescription] =
    useState('');

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Student';

  const filteredSubjects = useMemo(() => {
    const query =
      searchText.trim().toLowerCase();

    if (!query) {
      return subjects;
    }

    return subjects.filter(subject => {
      const nameMatches =
        subject.name
          .toLowerCase()
          .includes(query);

      const descriptionMatches =
        subject.description
          ?.toLowerCase()
          .includes(query) ?? false;

      return (
        nameMatches ||
        descriptionMatches
      );
    });
  }, [subjects, searchText]);

  const closeAddModal = () => {
    if (creating) {
      return;
    }

    setName('');
    setDescription('');
    setAddModalVisible(false);
  };

  const handleCreateSubject = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert(
        'Subject name required',
        'Please enter a name for your subject.',
      );

      return;
    }

    try {
      await createSubject(
        trimmedName,
        description.trim() || undefined,
      );

      setName('');
      setDescription('');
      setAddModalVisible(false);
    } catch (createError) {
      console.error(
        'Create subject error:',
        createError,
      );

      Alert.alert(
        'Unable to create subject',
        'Something went wrong while creating the subject. Please try again.',
      );
    }
  };

  /*
   * The same error state is also used when creating
   * a subject.
   *
   * Therefore we only show the full-page load error
   * when there are no subjects available.
   */
  const showLoadError =
    !loading &&
    !!error &&
    subjects.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* =================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                Subjects
              </Text>

              <Text style={styles.headerSubtitle}>
                Organize everything you're learning.
              </Text>
            </View>

            <AccountMenu
              displayName={displayName}
            />
          </View>

          {/* =================================================
              LIBRARY OVERVIEW
          ================================================== */}

          <View style={styles.overviewCard}>

            <View style={styles.overviewDecorationOne} />
            <View style={styles.overviewDecorationTwo} />

            <View style={styles.overviewIcon}>
              <BookOpen
                size={23}
                color="#FFFFFF"
                strokeWidth={2.1}
              />
            </View>

            <View style={styles.overviewContent}>
              <Text style={styles.overviewLabel}>
                YOUR LEARNING LIBRARY
              </Text>

              <Text style={styles.overviewNumber}>
                {subjects.length}
              </Text>

              <Text style={styles.overviewDescription}>
                {subjects.length === 1
                  ? 'subject ready for your learning materials'
                  : 'subjects ready for your learning materials'}
              </Text>
            </View>

          </View>

          {/* =================================================
              SEARCH
          ================================================== */}

          <View style={styles.searchContainer}>
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
              onChangeText={setSearchText}
              returnKeyType="search"
            />

            {searchText.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() =>
                  setSearchText('')
                }
                hitSlop={10}
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

          {/* =================================================
              SECTION HEADING
          ================================================== */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Your subjects
            </Text>

            {!loading && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {filteredSubjects.length}
                </Text>
              </View>
            )}
          </View>

          {/* =================================================
              LOADING
          ================================================== */}

          {loading ? (
            <View style={styles.stateContainer}>

              <View style={styles.loadingIcon}>
                <ActivityIndicator
                  size="small"
                  color="#4F46E5"
                />
              </View>

              <Text style={styles.stateTitle}>
                Loading your subjects
              </Text>

              <Text style={styles.stateDescription}>
                Preparing your learning library...
              </Text>

            </View>
          ) : showLoadError ? (

            /* ===============================================
                ERROR
            ================================================ */

            <View style={styles.stateContainer}>

              <View style={styles.errorIcon}>
                <RefreshCw
                  size={26}
                  color="#DC2626"
                />
              </View>

              <Text style={styles.stateTitle}>
                Couldn't load subjects
              </Text>

              <Text style={styles.stateDescription}>
                Check your connection and try again.
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

                <Text style={styles.retryButtonText}>
                  Try again
                </Text>

              </Pressable>

            </View>
          ) : filteredSubjects.length === 0 ? (

            /* ===============================================
                EMPTY / SEARCH STATE
            ================================================ */

            <View style={styles.emptyState}>

              <View style={styles.emptyIconOuter}>
                <View style={styles.emptyIconInner}>
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

              <Text style={styles.emptyTitle}>
                {searchText.trim()
                  ? 'No subjects found'
                  : 'Create your first subject'}
              </Text>

              <Text style={styles.emptyDescription}>
                {searchText.trim()
                  ? `We couldn't find anything matching "${searchText.trim()}".`
                  : 'Subjects help you organize notes, PDFs, images and other learning materials.'}
              </Text>

              {!searchText.trim() && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    setAddModalVisible(true)
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

                  <Text style={styles.emptyButtonText}>
                    Add subject
                  </Text>

                </Pressable>
              )}

            </View>
          ) : (

            /* ===============================================
                SUBJECT CARDS
            ================================================ */

            <View>
              {filteredSubjects.map(
                (subject, index) => {

                  const accent =
                    subjectPalette[
                      index %
                        subjectPalette.length
                    ];

                  return (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      accent={accent}
                    />
                  );
                },
              )}
            </View>
          )}

          {/* Bottom breathing room */}

          <View style={styles.bottomSpace} />

        </ScrollView>

        {/* =================================================
            FLOATING ADD BUTTON
        ================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add subject"
          onPress={() =>
            setAddModalVisible(true)
          }
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

      {/* ===================================================
          ADD SUBJECT MODAL
      ==================================================== */}

      <Modal
        transparent
        animationType="fade"
        visible={addModalVisible}
        statusBarTranslucent
        onRequestClose={closeAddModal}>

        <KeyboardAvoidingView
          style={styles.modalKeyboardView}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }>

          <Pressable
            style={styles.modalOverlay}
            onPress={closeAddModal}>

            <Pressable
              style={styles.modalCard}
              onPress={event =>
                event.stopPropagation()
              }>

              {/* Modal icon */}

              <View style={styles.modalIcon}>
                <Sparkles
                  size={24}
                  color="#4F46E5"
                  strokeWidth={2}
                />
              </View>

              <Text style={styles.modalTitle}>
                Create a subject
              </Text>

              <Text style={styles.modalSubtitle}>
                Create a learning space for your
                materials and AI study tools.
              </Text>

              {/* Name */}

              <Text style={styles.inputLabel}>
                Subject name
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Operating Systems"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                editable={!creating}
                autoFocus
                maxLength={80}
                returnKeyType="next"
              />

              {/* Description */}

              <Text style={styles.inputLabel}>
                Description
                <Text style={styles.optionalText}>
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
                onChangeText={setDescription}
                editable={!creating}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />

              <Text style={styles.characterCount}>
                {description.length}/200
              </Text>

              {/* Actions */}

              <View style={styles.modalActions}>

                <Pressable
                  disabled={creating}
                  onPress={closeAddModal}
                  style={({pressed}) => [
                    styles.cancelButton,
                    pressed &&
                      styles.secondaryPressed,
                  ]}>

                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>

                </Pressable>

                <Pressable
                  disabled={
                    creating ||
                    !name.trim()
                  }
                  onPress={handleCreateSubject}
                  style={({pressed}) => [
                    styles.createButton,

                    (!name.trim() ||
                      creating) &&
                      styles.createButtonDisabled,

                    pressed &&
                      !creating &&
                      !!name.trim() &&
                      styles.buttonPressed,
                  ]}>

                  {creating ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Plus
                        size={18}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.createButtonText
                        }>
                        Create subject
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