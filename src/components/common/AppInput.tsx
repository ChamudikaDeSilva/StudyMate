import React, {ReactNode} from 'react';
import {Text, TextInput, TextInputProps, View} from 'react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightAccessory?: ReactNode;
  containerClassName?: string;
}

const AppInput = ({
  label,
  error,
  helperText,
  leftIcon,
  rightAccessory,
  containerClassName = '',
  multiline,
  ...textInputProps
}: AppInputProps) => {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {!!label && (
        <Text className="mb-2 text-sm font-semibold text-slate-800">
          {label}
        </Text>
      )}

      <View
        className="flex-row items-center rounded-xl border bg-white px-4"
        style={{
          borderColor: error ? '#EF4444' : '#E2E8F0',
          alignItems: multiline ? 'flex-start' : 'center',
        }}>
        {!!leftIcon && (
          <View className={multiline ? 'mr-3 mt-4' : 'mr-3'}>{leftIcon}</View>
        )}

        <TextInput
          {...textInputProps}
          multiline={multiline}
          placeholderTextColor="#94A3B8"
          className={`flex-1 text-base text-slate-900 ${
            multiline ? 'min-h-[120px] py-4' : 'min-h-[52px] py-3'
          }`}
          textAlignVertical={multiline ? 'top' : textInputProps.textAlignVertical}
        />

        {!!rightAccessory && (
          <View className={multiline ? 'ml-3 mt-4' : 'ml-3'}>{rightAccessory}</View>
        )}
      </View>

      {!!error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
      {!error && !!helperText && (
        <Text className="mt-1 text-xs text-slate-400">{helperText}</Text>
      )}
    </View>
  );
};

export default AppInput;
