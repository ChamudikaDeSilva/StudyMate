import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {LucideIcon} from 'lucide-react-native';
import AppButton from './AppButton';

interface ScreenStateProps {
  title: string;
  description?: string;
  loading?: boolean;
  icon?: LucideIcon;
  iconColor?: string;
  actionTitle?: string;
  onAction?: () => void;
  dark?: boolean;
}

const ScreenState = ({
  title,
  description,
  loading = false,
  icon: Icon,
  iconColor = '#4F46E5',
  actionTitle,
  onAction,
  dark = false,
}: ScreenStateProps) => {
  return (
    <View className="min-h-[270px] flex-1 items-center justify-center px-8">
      <View
        className="mb-4 h-[54px] w-[54px] items-center justify-center rounded-[17px]"
        style={{backgroundColor: dark ? '#1E293B' : '#EEF2FF'}}>
        {loading ? (
          <ActivityIndicator size="small" color={dark ? '#38BDF8' : '#4F46E5'} />
        ) : Icon ? (
          <Icon size={26} color={iconColor} />
        ) : null}
      </View>

      <Text
        className="text-center text-lg font-bold"
        style={{color: dark ? '#FFFFFF' : '#0F172A'}}>
        {title}
      </Text>
      {!!description && (
        <Text
          className="mt-2 max-w-[300px] text-center text-sm leading-5"
          style={{color: dark ? '#94A3B8' : '#64748B'}}>
          {description}
        </Text>
      )}

      {!!actionTitle && !!onAction && (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          variant={dark ? 'solid' : 'soft'}
          tone={dark ? 'info' : 'primary'}
          className="mt-6"
        />
      )}
    </View>
  );
};

export default ScreenState;
