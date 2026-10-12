import React, { forwardRef, ReactNode, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors } from '../../constants/colors';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightAccessory?: ReactNode;
  containerClassName?: string;
}

export type AppInputRef = React.ComponentRef<typeof TextInput>;

const AppInput = forwardRef<AppInputRef, AppInputProps>(function InputField(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightAccessory,
    containerClassName = '',
    multiline,
    onFocus,
    onBlur,
    ...textInputProps
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const editable = textInputProps.editable !== false;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {!!label && (
        <Text className="mb-2 text-sm font-semibold text-slate-800">
          {label}
        </Text>
      )}

      <View
        className="flex-row items-center rounded-[18px] border bg-white px-4"
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.focused,
          !editable && styles.disabled,
          !!error && styles.error,
        ]}
      >
        {!!leftIcon && (
          <View className={multiline ? 'mr-3 mt-4' : 'mr-3'}>{leftIcon}</View>
        )}

        <TextInput
          {...textInputProps}
          ref={ref}
          accessibilityLabel={textInputProps.accessibilityLabel ?? label}
          accessibilityHint={
            error || textInputProps.accessibilityHint || helperText
          }
          multiline={multiline}
          placeholderTextColor={colors.textMuted}
          selectionColor={textInputProps.selectionColor ?? colors.primary}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={`flex-1 text-base text-slate-900 ${
            multiline ? 'min-h-[120px] py-4' : 'min-h-[52px] py-3'
          }`}
          textAlignVertical={
            multiline ? 'top' : textInputProps.textAlignVertical
          }
        />

        {!!rightAccessory && (
          <View className={multiline ? 'ml-3 mt-4' : 'ml-3'}>
            {rightAccessory}
          </View>
        )}
      </View>

      {!!error && (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-1.5 text-xs leading-4 text-red-600"
        >
          {error}
        </Text>
      )}
      {!error && !!helperText && (
        <Text className="mt-1.5 text-xs leading-4 text-slate-500">
          {helperText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  multiline: {
    alignItems: 'flex-start',
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  disabled: {
    backgroundColor: colors.background,
  },
  error: {
    borderColor: colors.danger,
  },
});

export default AppInput;
