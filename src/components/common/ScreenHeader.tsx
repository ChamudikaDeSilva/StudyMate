import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import BackButton from './BackButton';
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBack?: () => void;
  right?: ReactNode;
}
const ScreenHeader = ({
  title,
  subtitle,
  eyebrow,
  onBack,
  right,
}: ScreenHeaderProps) => (
  <View className="mb-7 flex-row items-center">
    {!!onBack && (
      <View className="mr-4">
        <BackButton onPress={onBack} />
      </View>
    )}
    <View className="flex-1">
      {!!eyebrow && (
        <Text className="mb-1.5 text-[10px] font-bold uppercase tracking-[1.8px] text-brand-600">
          {eyebrow}
        </Text>
      )}
      <Text
        accessibilityRole="header"
        numberOfLines={2}
        className="text-[28px] font-bold leading-[34px] tracking-tight text-ink"
      >
        {title}
      </Text>
      {!!subtitle && (
        <Text numberOfLines={2} className="mt-1.5 text-sm leading-5 text-muted">
          {subtitle}
        </Text>
      )}
    </View>
    {!!right && <View className="ml-3">{right}</View>}
  </View>
);
export default ScreenHeader;
