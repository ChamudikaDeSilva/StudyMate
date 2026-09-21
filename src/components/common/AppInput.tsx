import React from 'react';

import {
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

interface AppInputProps
  extends TextInputProps {
  label: string;
  error?: string;
}

const AppInput = ({
  label,
  error,
  ...textInputProps
}: AppInputProps) => {
  return (
    <View className="mb-4">

      {/* Label */}
      <Text
        className="
          mb-2
          text-sm
          font-semibold
          text-slate-800
        ">
        {label}
      </Text>

      {/* Input */}
      <TextInput
        {...textInputProps}
        placeholderTextColor="#64748B"
        className={`
          min-h-[52px]
          rounded-xl
          border
          bg-white
          px-4
          py-3
          text-base
          text-slate-900
          ${
            error
              ? 'border-red-500'
              : 'border-slate-200'
          }
        `}
      />

      {/* Error */}
      {error ? (
        <Text
          className="
            mt-1
            text-xs
            text-red-500
          ">
          {error}
        </Text>
      ) : null}

    </View>
  );
};

export default AppInput;