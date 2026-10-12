import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import AppButton from './AppButton';
interface ScreenStateProps {
  title: string;
  description?: string;
  loading?: boolean;
  icon?: LucideIcon;
  iconColor?: string;
  actionTitle?: string;
  onAction?: () => void;
  actionBusy?: boolean;
  dark?: boolean;
}
const ScreenState = ({
  title,
  description,
  loading = false,
  icon: Icon,
  iconColor = colors.primary,
  actionTitle,
  onAction,
  actionBusy = false,
  dark = false,
}: ScreenStateProps) => (
  <View className="min-h-[290px] flex-1 items-center justify-center px-6 py-8">
    <View
      className="mb-5 h-[72px] w-[72px] items-center justify-center rounded-[24px]"
      style={{
        backgroundColor: dark ? colors.darkSurface : colors.primaryLight,
      }}
    >
      {loading ? (
        <ActivityIndicator
          accessibilityLabel={title}
          size="small"
          color={dark ? colors.accent : colors.primary}
        />
      ) : Icon ? (
        <Icon size={30} color={iconColor} />
      ) : null}
    </View>
    <Text
      accessibilityRole="header"
      className="text-center text-xl font-bold leading-7"
      style={{ color: dark ? colors.white : colors.textPrimary }}
    >
      {title}
    </Text>
    {!!description && (
      <Text
        className="mt-3 max-w-[320px] text-center text-sm leading-[22px]"
        style={{ color: dark ? colors.textMuted : colors.textSecondary }}
      >
        {description}
      </Text>
    )}
    {!!actionTitle && !!onAction && (
      <AppButton
        title={actionTitle}
        onPress={onAction}
        loading={actionBusy}
        disabled={actionBusy}
        variant={dark ? 'solid' : 'soft'}
        className="mt-6"
      />
    )}
  </View>
);
export default ScreenState;
