import React from 'react';
import {Pressable, Text} from 'react-native';
import {LucideIcon} from 'lucide-react-native';

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
      accessibilityState={{selected}}
      onPress={onPress}
      className="mr-2 flex-row items-center rounded-full border px-4 py-2"
      style={({pressed}) => ({
        backgroundColor: selected ? background : '#FFFFFF',
        borderColor: selected ? color : '#E2E8F0',
        opacity: pressed ? 0.78 : 1,
      })}>
      <Icon size={15} color={selected ? color : '#64748B'} />
      <Text
        className="ml-2 text-sm font-semibold"
        style={{color: selected ? color : '#475569'}}>
        {label}
      </Text>
    </Pressable>
  );
};

export default MaterialFilterChip;
