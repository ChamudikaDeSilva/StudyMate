import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {EllipsisVertical, FolderOpen} from 'lucide-react-native';
import {SubjectAccent} from '../../constants/subjectPalette';
import {Subject} from '../../domain/models/Subject';

interface SubjectCardProps {
  subject: Subject;
  accent: SubjectAccent;
  onPress: () => void;
  onOptionsPress: (subject: Subject) => void;
  busy?: boolean;
}

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'S';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const SubjectCard = ({
  subject,
  accent,
  onPress,
  onOptionsPress,
  busy = false,
}: SubjectCardProps) => {
  const description =
    subject.description?.trim() || 'Organize your learning materials in this subject.';

  return (
    <Pressable
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={`Open ${subject.name}`}
      onPress={onPress}
      className="mb-4 flex-row items-center rounded-[20px] border border-slate-200 bg-white p-4"
      style={({pressed}) => ({
        opacity: busy ? 0.6 : pressed ? 0.8 : 1,
        transform: [{scale: !busy && pressed ? 0.99 : 1}],
      })}>
      <View
        className="mr-4 h-[58px] w-[58px] items-center justify-center rounded-[17px]"
        style={{backgroundColor: accent.background}}>
        <Text className="text-lg font-extrabold" style={{color: accent.foreground}}>
          {getInitials(subject.name)}
        </Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
          {subject.name}
        </Text>
        <Text className="mt-1 text-xs leading-[18px] text-slate-500" numberOfLines={2}>
          {description}
        </Text>
        <View className="mt-2 flex-row items-center">
          <FolderOpen size={14} color={accent.foreground} strokeWidth={2} />
          <Text className="ml-1 text-[11px] font-semibold" style={{color: accent.foreground}}>
            Learning subject
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Options for ${subject.name}`}
        disabled={busy}
        hitSlop={10}
        onPress={event => {
          event.stopPropagation();
          onOptionsPress(subject);
        }}
        className="ml-2 h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <EllipsisVertical size={21} color="#64748B" strokeWidth={2} />
      </Pressable>
    </Pressable>
  );
};

export default SubjectCard;
