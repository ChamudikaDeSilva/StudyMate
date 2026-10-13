import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../constants/colors';
export type ActionButtonTone =
  | 'primary'
  | 'info'
  | 'success'
  | 'danger'
  | 'neutral';
export type ActionButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';
interface ActionButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: ActionButtonTone;
  variant?: ActionButtonVariant;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}
const toneConfig: Record<ActionButtonTone, { main: string; soft: string }> = {
  primary: { main: colors.primary, soft: colors.primaryLight },
  info: { main: colors.info, soft: colors.infoLight },
  success: { main: colors.success, soft: colors.successLight },
  danger: { main: colors.danger, soft: '#FEF2F2' },
  neutral: { main: colors.textSecondary, soft: colors.surfaceSecondary },
};
const ActionButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  tone = 'primary',
  variant = 'solid',
  icon,
  style,
}: ActionButtonProps) => {
  const palette = toneConfig[tone];
  const isDisabled = disabled || loading;
  const textColor = variant === 'solid' ? colors.white : palette.main;
  const backgroundColor =
    variant === 'solid'
      ? palette.main
      : variant === 'soft'
      ? palette.soft
      : 'transparent';
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      activeOpacity={0.78}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor: palette.main,
        },
        variant === 'outline' && styles.outline,
        isDisabled && styles.disabled,
        variant === 'solid' && styles.shadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          accessibilityLabel={title}
          size="small"
          color={textColor}
        />
      ) : (
        <>
          {!!icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 18,
  },
  outline: { borderWidth: 1 },
  disabled: { opacity: 0.45 },
  shadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  icon: { marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  text: {
    flexShrink: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
});
export default ActionButton;
