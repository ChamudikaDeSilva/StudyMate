import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArrowRight, EllipsisVertical, FolderOpen } from 'lucide-react-native';
import { SubjectAccent } from '../../constants/subjectPalette';
import { Subject } from '../../domain/models/Subject';
import { getInitials } from '../../utils/userUtils';
import { colors } from '../../constants/colors';
import SectionCard from '../common/SectionCard';

interface SubjectCardProps {
  subject: Subject;
  accent: SubjectAccent;
  onPress: () => void;
  onOptionsPress?: (subject: Subject) => void;
  busy?: boolean;
  layout?: 'list' | 'tile';
}

const SubjectCard = ({
  subject,
  accent,
  onPress,
  onOptionsPress,
  busy = false,
  layout = 'list',
}: SubjectCardProps) => {
  const description =
    subject.description?.trim() ||
    'Organize your learning materials in this subject.';

  const tile = layout === 'tile';
  const initials = (
    <View
      className={`h-[54px] w-[54px] items-center justify-center rounded-[18px] ${
        tile ? '' : 'mr-3'
      }`}
      style={{ backgroundColor: accent.background }}
    >
      <Text
        className="text-lg font-extrabold"
        style={{ color: accent.foreground }}
      >
        {getInitials(subject.name)}
      </Text>
    </View>
  );
  const details = (
    <View className={tile ? 'mt-4' : 'flex-1'}>
      <Text
        className="text-base font-bold leading-[22px] text-ink"
        numberOfLines={2}
      >
        {subject.name}
      </Text>
      {!tile && (
        <Text
          className="mt-1.5 text-xs leading-[18px] text-muted"
          numberOfLines={2}
        >
          {description}
        </Text>
      )}
      <View className="mt-2 flex-row items-center">
        <FolderOpen size={14} color={accent.foreground} strokeWidth={2} />
        <Text
          className="ml-1 text-[11px] font-semibold"
          style={{ color: accent.foreground }}
        >
          View materials
        </Text>
      </View>
    </View>
  );
  const action = onOptionsPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Options for ${subject.name}`}
      accessibilityState={{ disabled: busy }}
      disabled={busy}
      hitSlop={10}
      onPress={event => {
        event.stopPropagation();
        onOptionsPress(subject);
      }}
      className="ml-2 h-10 w-10 items-center justify-center rounded-2xl border border-line bg-canvas active:opacity-60"
    >
      <EllipsisVertical
        size={19}
        color={colors.textSecondary}
        strokeWidth={2}
      />
    </Pressable>
  ) : (
    <View className="ml-2 h-9 w-9 items-center justify-center rounded-full bg-brand-50">
      <ArrowRight size={18} color={colors.primary} />
    </View>
  );

  return (
    <Pressable
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={`Open ${subject.name}`}
      accessibilityHint="View the materials in this subject"
      accessibilityState={{ disabled: busy, busy }}
      onPress={onPress}
      className={`mb-3 ${
        busy ? 'opacity-60' : 'active:opacity-75 active:scale-[0.99]'
      }`}
    >
      <SectionCard className={tile ? 'min-h-[184px]' : 'flex-row items-center'}>
        {tile ? (
          <>
            <View className="flex-row items-center justify-between">
              {initials}
              {action}
            </View>
            {details}
          </>
        ) : (
          <>
            {initials}
            {details}
            {action}
          </>
        )}
      </SectionCard>
    </Pressable>
  );
};

export default SubjectCard;
