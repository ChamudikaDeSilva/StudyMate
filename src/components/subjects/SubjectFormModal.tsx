import React from 'react';
import {KeyboardAvoidingView, Modal, Platform, Pressable, Text, View} from 'react-native';
import {Pencil, Plus, Sparkles} from 'lucide-react-native';
import AppButton from '../common/AppButton';
import AppInput from '../common/AppInput';

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
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable className="flex-1 justify-center bg-slate-900/50 px-6" onPress={onClose}>
          <Pressable
            className="w-full self-center rounded-3xl bg-white p-6"
            onPress={event => event.stopPropagation()}>
            <View className="mb-4 h-[52px] w-[52px] items-center justify-center rounded-2xl bg-indigo-50">
              {editing ? (
                <Pencil size={23} color="#4F46E5" />
              ) : (
                <Sparkles size={24} color="#4F46E5" />
              )}
            </View>

            <Text className="text-[22px] font-bold tracking-tight text-slate-900">
              {editing ? 'Edit subject' : 'Create a subject'}
            </Text>
            <Text className="mb-6 mt-1 text-sm leading-5 text-slate-500">
              {editing
                ? 'Update the details of your learning subject.'
                : 'Create a learning space for your materials and AI study tools.'}
            </Text>

            <AppInput
              label="Subject name"
              placeholder="e.g. Operating Systems"
              value={name}
              onChangeText={onNameChange}
              editable={!submitting}
              maxLength={80}
              autoFocus
            />

            <AppInput
              label="Description (optional)"
              placeholder="What will you study here?"
              value={description}
              onChangeText={onDescriptionChange}
              editable={!submitting}
              multiline
              maxLength={200}
              helperText={`${description.length}/200`}
            />

            <View className="mt-2 flex-row justify-end">
              <AppButton
                title="Cancel"
                variant="outline"
                tone="neutral"
                disabled={submitting}
                onPress={onClose}
                className="mr-2 min-h-[48px]"
              />
              <AppButton
                title={editing ? 'Save changes' : 'Create subject'}
                icon={editing ? <Pencil size={17} color="#FFFFFF" /> : <Plus size={18} color="#FFFFFF" />}
                loading={submitting}
                disabled={!name.trim()}
                onPress={onSave}
                className="min-h-[48px]"
              />
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SubjectFormModal;
