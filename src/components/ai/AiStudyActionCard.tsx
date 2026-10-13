import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import SectionCard from '../common/SectionCard';

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  backgroundColor: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
}

const AiStudyActionCard = ({
  title,
  description,
  icon: Icon,
  color,
  backgroundColor,
  accessibilityLabel,
  onPress,
  disabled = false,
}: Props) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    className={disabled ? 'opacity-45' : 'active:opacity-80'}
  >
    <SectionCard className="flex-row items-center">
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor }}
      >
        <Icon size={23} color={color} strokeWidth={2} />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-base font-bold text-ink">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">{description}</Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </SectionCard>
  </Pressable>
);

export default AiStudyActionCard;
