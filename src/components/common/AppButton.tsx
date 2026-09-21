import React from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  Text,
  ViewStyle,
} from 'react-native';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost';

interface AppButtonProps {
  title: string;

  onPress: () => void;

  disabled?: boolean;

  loading?: boolean;

  variant?: ButtonVariant;

  /*
   * Kept for backward compatibility.
   * Existing screens may still pass
   * an inline style while we migrate.
   */
  style?: StyleProp<ViewStyle>;

  className?: string;
}

const AppButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  className = '',
}: AppButtonProps) => {
  const isDisabled =
    disabled || loading;

  // =========================================================
  // Variant styles
  // =========================================================

  const getButtonClasses = () => {
    switch (variant) {
      case 'secondary':
        return `
          bg-indigo-50
        `;

      case 'outline':
        return `
          border
          border-slate-200
          bg-white
        `;

      case 'ghost':
        return `
          bg-transparent
        `;

      case 'primary':
      default:
        return `
          bg-indigo-600
        `;
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case 'secondary':
      case 'outline':
      case 'ghost':
        return `
          text-indigo-600
        `;

      case 'primary':
      default:
        return `
          text-white
        `;
    }
  };

  const indicatorColor =
    variant === 'primary'
      ? '#FFFFFF'
      : '#4F46E5';

  // =========================================================
  // UI
  // =========================================================

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled:
          isDisabled,

        busy:
          loading,
      }}
      onPress={onPress}
      disabled={isDisabled}
      style={style}
      className={`
        min-h-[52px]
        items-center
        justify-center
        rounded-xl
        px-6

        active:opacity-80

        ${getButtonClasses()}

        ${
          isDisabled
            ? 'opacity-50'
            : ''
        }

        ${className}
      `}>

      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            indicatorColor
          }
        />
      ) : (
        <Text
          className={`
            text-base
            font-semibold

            ${getTextClasses()}
          `}>
          {title}
        </Text>
      )}

    </Pressable>
  );
};

export default AppButton;