import React from 'react';
import { Pressable, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface MaterialFilterChipProps {
  label: string;
  selected: boolean;
  icon: LucideIcon;
  color: string;
  background: string;
  onPress: () => void;
}

const MaterialFilterChip = ({
  label,
  selected,
  icon: Icon,
  color,
  background,
  onPress,
}: MaterialFilterChipProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="mr-2 min-h-[44px] flex-row items-center rounded-full border px-4 py-2 active:opacity-70"
      style={{
        backgroundColor: selected ? background : colors.surface,
        borderColor: selected ? color : colors.border,
      }}
    >
      <Icon size={15} color={selected ? color : colors.textSecondary} />
      <Text
        className="ml-2 text-sm font-semibold"
        style={{ color: selected ? color : colors.textSecondary }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default MaterialFilterChip;
