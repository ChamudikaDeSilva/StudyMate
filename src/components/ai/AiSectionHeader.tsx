import React from 'react';
import { Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  backgroundColor?: string;
}

const AiSectionHeader = ({
  title,
  description,
  icon: Icon,
  color = colors.primary,
  backgroundColor = colors.primaryLight,
}: Props) => (
  <View className="mb-4 flex-row items-center">
    <View
      className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
      style={{ backgroundColor }}
    >
      <Icon size={21} color={color} strokeWidth={2} />
    </View>
    <View className="flex-1">
      <Text className="text-base font-bold text-ink">{title}</Text>
      <Text className="mt-1 text-xs leading-[18px] text-muted">
        {description}
      </Text>
    </View>
  </View>
);

export default AiSectionHeader;
