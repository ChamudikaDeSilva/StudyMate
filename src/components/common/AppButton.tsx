import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import {theme} from '../../theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
}

const AppButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: AppButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      onPress={onPress}
      disabled={isDisabled}
      style={({pressed}) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? theme.colors.textOnPrimary
              : theme.colors.primary
          }
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary'
              ? styles.primaryText
              : styles.secondaryText,
          ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },

  primary: {
    backgroundColor: theme.colors.primary,
  },

  secondary: {
    backgroundColor: theme.colors.primaryLight,
  },

  outline: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  pressed: {
    opacity: 0.82,
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
  },

  primaryText: {
    color: theme.colors.textOnPrimary,
  },

  secondaryText: {
    color: theme.colors.primary,
  },
});

export default AppButton;