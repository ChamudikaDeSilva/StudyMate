import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

const AppInput = ({
  label,
  error,
  ...textInputProps
}: AppInputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        {...textInputProps}
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          error ? styles.inputError : undefined,
        ]}
      />

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.xs,
    fontSize: 12,
  },
});

export default AppInput;