import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Pencil, Trash2, X } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { Subject } from '../../domain/models/Subject';
import AppButton from '../common/AppButton';
import AppModal from '../common/AppModal';

interface SubjectActionsSheetProps {
  visible: boolean;
  subject: Subject | null;
  onClose: () => void;
  onDismiss?: () => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

const SubjectActionsSheet = ({
  visible,
  subject,
  onClose,
  onDismiss,
  onEdit,
  onDelete,
}: SubjectActionsSheetProps) => (
  <AppModal
    transparent
    animationType="fade"
    visible={visible}
    statusBarTranslucent
    onRequestClose={onClose}
    onDismiss={onDismiss}
  >
    <View className="flex-1 justify-end bg-ink/50">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close subject actions"
        onPress={onClose}
        className="absolute inset-0"
      />
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        accessibilityViewIsModal
        className="rounded-t-[32px] border border-line bg-white"
      >
        <View className="px-6 pb-6 pt-3">
          <View className="mb-5 h-[5px] w-[42px] self-center rounded-full bg-line" />
          <View className="mb-6 flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
              <BookOpen size={22} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text
                accessibilityRole="header"
                className="text-xl font-bold text-ink"
                numberOfLines={2}
              >
                {subject?.name ?? 'Subject'}
              </Text>
              <Text className="mt-1 text-sm text-muted">
                Manage this subject
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close subject actions"
              onPress={onClose}
              className="ml-3 h-11 w-11 items-center justify-center rounded-full bg-canvas active:opacity-60"
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <AppButton
            title="Edit subject"
            icon={<Pencil size={19} color={colors.primary} />}
            variant="soft"
            disabled={!subject}
            onPress={() => {
              if (subject) {
                onEdit(subject);
              }
            }}
          />
          <AppButton
            title="Delete subject"
            icon={<Trash2 size={19} color={colors.danger} />}
            tone="danger"
            variant="soft"
            disabled={!subject}
            className="mt-3"
            onPress={() => {
              if (subject) {
                onDelete(subject);
              }
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  </AppModal>
);

export default SubjectActionsSheet;
