import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';
import {useSubjects} from '../../hooks/useSubjects';

const SubjectsScreen = () => {
  const {
    subjects,
    loading,
    creating,
    error,
    createSubject,
  } = useSubjects();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const closeModal = () => {
    if (creating) {
      return;
    }

    setModalVisible(false);
    setName('');
    setDescription('');
  };

  const handleCreateSubject = async () => {
    if (!name.trim()) {
      Alert.alert(
        'Subject name required',
        'Please enter a subject name.',
      );
      return;
    }

    try {
      await createSubject(name, description);

      closeModal();
    } catch {
      Alert.alert(
        'Unable to create subject',
        'Please check your connection and try again.',
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading subjects...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            My Subjects
          </Text>

          <Text style={styles.subtitle}>
            Organize your learning materials
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      <FlatList
        data={subjects}
        keyExtractor={item => item.id}
        contentContainerStyle={
          subjects.length === 0
            ? styles.emptyList
            : styles.list
        }
        renderItem={({item}) => (
          <Pressable style={styles.subjectCard}>
            <Text style={styles.subjectName}>
              {item.name}
            </Text>

            {item.description ? (
              <Text style={styles.subjectDescription}>
                {item.description}
              </Text>
            ) : null}

            <Text style={styles.syncText}>
              {item.syncStatus === 'synced'
                ? 'Synced'
                : item.syncStatus}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No subjects yet
            </Text>

            <Text style={styles.emptyText}>
              Create your first subject to start adding
              learning materials.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyButtonText}>
                Create Subject
              </Text>
            </Pressable>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              New Subject
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Subject name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              editable={!creating}
            />

            <TextInput
              style={[
                styles.input,
                styles.descriptionInput,
              ]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              editable={!creating}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeModal}
                disabled={creating}>
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.saveButton,
                  creating && styles.disabledButton,
                ]}
                onPress={handleCreateSubject}
                disabled={creating}>
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    Create
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 32,
  },

  list: {
    paddingBottom: spacing.xl,
  },

  subjectCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  subjectDescription: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },

  syncText: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.textSecondary,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  emptyText: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 21,
  },

  emptyButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  errorText: {
    color: colors.danger,
    marginBottom: spacing.md,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },

  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  descriptionInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },

  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  cancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },

  saveButton: {
    minWidth: 100,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SubjectsScreen;