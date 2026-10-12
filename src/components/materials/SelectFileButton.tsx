import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { LucideIcon, UploadCloud } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface SelectFileButtonProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  color: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

const SelectFileButton = ({
  title,
  description = 'Choose a file from your device.',
  icon: Icon = UploadCloud,
  color,
  loading = false,
  disabled = false,
  onPress,
}: SelectFileButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      className={`mb-5 min-h-[144px] items-center justify-center rounded-[20px] border border-dashed border-brand-200 bg-brand-50 px-4 ${
        disabled || loading ? 'opacity-60' : 'active:opacity-70'
      }`}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          <Icon size={28} color={color} />
          <Text className="mt-3 text-base font-bold text-ink">{title}</Text>
          <Text
            className="mt-1 text-xs"
            style={{ color: colors.textSecondary }}
          >
            {description}
          </Text>
        </>
      )}
    </Pressable>
  );
};

export default SelectFileButton;
