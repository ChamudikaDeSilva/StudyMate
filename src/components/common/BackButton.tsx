import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface BackButtonProps {
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  tone?: 'light' | 'dark';
}

const BackButton = ({
  onPress,
  disabled = false,
  accessibilityLabel = 'Go back',
  tone = 'light',
}: BackButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ disabled }}
    disabled={disabled}
    hitSlop={12}
    onPress={onPress}
    className="active:opacity-60 active:scale-95"
    style={[
      styles.button,
      tone === 'dark' && styles.dark,
      disabled && styles.disabled,
    ]}
  >
    <ArrowLeft
      size={21}
      color={tone === 'dark' ? colors.white : colors.primary}
      strokeWidth={2.2}
    />
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dark: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: colors.darkSurface,
  },
  disabled: { opacity: 0.45 },
});

export default BackButton;
