import React from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {LucideIcon, Pencil, Trash2} from 'lucide-react-native';
import {Subject} from '../../domain/models/Subject';

interface SubjectActionsSheetProps {
  visible: boolean;
  subject: Subject | null;
  onClose: () => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

const SubjectActionsSheet = ({
  visible,
  subject,
  onClose,
  onEdit,
  onDelete,
}: SubjectActionsSheetProps) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-slate-900/50" onPress={onClose}>
        <Pressable
          className="rounded-t-[26px] bg-white px-6 pb-8 pt-2"
          onPress={event => event.stopPropagation()}>
          <View className="mb-6 h-[5px] w-[42px] self-center rounded-full bg-slate-200" />

          <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>
            {subject?.name ?? 'Subject'}
          </Text>
          <Text className="mt-1 text-sm text-slate-500">Manage this subject</Text>
          <View className="my-4 h-px bg-slate-200" />

          <ActionRow
            title="Edit subject"
            description="Change the name or description"
            icon={Pencil}
            color="#4F46E5"
            background="#EEF2FF"
            onPress={() => subject && onEdit(subject)}
          />
          <ActionRow
            title="Delete subject"
            description="Permanently remove this subject"
            icon={Trash2}
            color="#DC2626"
            background="#FEF2F2"
            onPress={() => subject && onDelete(subject)}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

interface ActionRowProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  background: string;
  onPress: () => void;
}

const ActionRow = ({title, description, icon: Icon, color, background, onPress}: ActionRowProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    className="min-h-[72px] flex-row items-center rounded-2xl px-2 py-2"
    style={({pressed}) => ({opacity: pressed ? 0.75 : 1})}>
    <View
      className="mr-4 h-11 w-11 items-center justify-center rounded-[13px]"
      style={{backgroundColor: background}}>
      <Icon size={20} color={color} />
    </View>
    <View className="flex-1">
      <Text className="text-base font-bold" style={{color}}>{title}</Text>
      <Text className="mt-1 text-xs leading-[17px] text-slate-500">{description}</Text>
    </View>
  </Pressable>
);

export default SubjectActionsSheet;
