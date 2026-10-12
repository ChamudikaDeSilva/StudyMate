import React, { useRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pencil, Plus, Sparkles, X } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import AppButton from '../common/AppButton';
import AppInput, { AppInputRef } from '../common/AppInput';
import SectionCard from '../common/SectionCard';

interface SubjectFormModalProps {
  visible: boolean;
  editing: boolean;
  name: string;
  description: string;
  submitting: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const SubjectFormModal = ({
  visible,
  editing,
  name,
  description,
  submitting,
  onNameChange,
  onDescriptionChange,
  onClose,
  onSave,
}: SubjectFormModalProps) => {
  const descriptionRef = useRef<AppInputRef>(null);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-ink/50"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView
          edges={['top', 'bottom', 'left', 'right']}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="flex-grow px-6 py-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Pressable
              accessible={false}
              disabled={submitting}
              className="flex-grow justify-center"
              onPress={onClose}
            >
              <Pressable
                accessible={false}
                className="w-full max-w-[520px] self-center"
                onPress={event => event.stopPropagation()}
              >
                <SectionCard accessibilityViewIsModal>
                  <View className="mb-4 flex-row items-center justify-between">
                    <View className="h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-brand-50">
                      {editing ? (
                        <Pencil size={23} color={colors.primary} />
                      ) : (
                        <Sparkles size={24} color={colors.primary} />
                      )}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Close subject form"
                      accessibilityState={{ disabled: submitting }}
                      disabled={submitting}
                      onPress={onClose}
                      className={`h-11 w-11 items-center justify-center rounded-full bg-canvas ${
                        submitting ? 'opacity-40' : 'active:opacity-60'
                      }`}
                    >
                      <X size={20} color={colors.textSecondary} />
                    </Pressable>
                  </View>

                  <Text className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-brand-600">
                    Your learning space
                  </Text>
                  <Text
                    accessibilityRole="header"
                    className="text-[24px] font-bold tracking-tight text-ink"
                  >
                    {editing ? 'Edit subject' : 'Create a subject'}
                  </Text>
                  <Text className="mb-6 mt-2 text-sm leading-5 text-muted">
                    {editing
                      ? 'Keep your learning space up to date.'
                      : 'Give your notes and study materials a place to belong.'}
                  </Text>

                  <AppInput
                    label="Subject name"
                    placeholder="e.g. Operating Systems"
                    value={name}
                    onChangeText={onNameChange}
                    editable={!submitting}
                    maxLength={80}
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={() => descriptionRef.current?.focus()}
                  />
                  <AppInput
                    ref={descriptionRef}
                    label="Description (optional)"
                    placeholder="What will you study here?"
                    value={description}
                    onChangeText={onDescriptionChange}
                    editable={!submitting}
                    multiline
                    maxLength={200}
                    helperText={`${description.length}/200`}
                  />

                  <AppButton
                    title={editing ? 'Save changes' : 'Create subject'}
                    icon={
                      editing ? (
                        <Pencil size={17} color={colors.white} />
                      ) : (
                        <Plus size={18} color={colors.white} />
                      )
                    }
                    loading={submitting}
                    disabled={submitting || !name.trim()}
                    onPress={onSave}
                    className="mt-2"
                  />
                  <AppButton
                    title="Cancel"
                    variant="ghost"
                    tone="neutral"
                    disabled={submitting}
                    onPress={onClose}
                    className="mt-2"
                  />
                </SectionCard>
              </Pressable>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SubjectFormModal;
