import React from 'react';
import {ActivityIndicator, Pressable, Text} from 'react-native';
import {UploadCloud} from 'lucide-react-native';

interface SelectFileButtonProps {
  title: string;
  color: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

const SelectFileButton = ({
  title,
  color,
  loading = false,
  disabled = false,
  onPress,
}: SelectFileButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      className="mb-5 min-h-[110px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50"
      style={({pressed}) => ({
        opacity: disabled || loading ? 0.6 : pressed ? 0.8 : 1,
      })}>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          <UploadCloud size={28} color={color} />
          <Text className="mt-3 font-bold text-slate-800">{title}</Text>
        </>
      )}
    </Pressable>
  );
};

export default SelectFileButton;
