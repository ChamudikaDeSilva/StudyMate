import React, { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface SelectedFileCardProps {
  icon: ReactNode;
  name: string;
  details: string;
  disabled?: boolean;
  onRemove: () => void;
}

const SelectedFileCard = ({
  icon,
  name,
  details,
  disabled = false,
  onRemove,
}: SelectedFileCardProps) => {
  return (
    <View className="mb-5 flex-row items-center rounded-[20px] border border-line bg-canvas p-4">
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-white">
        {icon}
      </View>
      <View className="flex-1">
        <Text numberOfLines={2} className="font-bold text-ink">
          {name}
        </Text>
        <Text className="mt-1 text-xs text-muted">{details}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove file"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onRemove}
        className={`ml-2 h-11 w-11 items-center justify-center rounded-xl bg-white ${
          disabled ? 'opacity-50' : 'active:opacity-60'
        }`}
      >
        <X size={17} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
};

export default SelectedFileCard;
