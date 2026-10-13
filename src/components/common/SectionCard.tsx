import React, { ReactNode } from 'react';
import { Text, View, ViewProps } from 'react-native';
import { shadows } from '../../constants/shadows';
interface SectionCardProps extends ViewProps {
  label?: string;
  children: ReactNode;
  className?: string;
}
const SectionCard = ({
  label,
  children,
  className = '',
  style,
  ...viewProps
}: SectionCardProps) => (
  <View
    {...viewProps}
    className={`rounded-[26px] border border-line bg-white p-5 ${className}`}
    style={[shadows.sm, style]}
  >
    {!!label && (
      <Text className="mb-3 text-[10px] font-bold uppercase tracking-[1.5px] text-brand-600">
        {label}
      </Text>
    )}
    {children}
  </View>
);
export default SectionCard;
