import React, {ReactNode} from 'react';
import {Text, View} from 'react-native';

interface SectionCardProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

const SectionCard = ({label, children, className = ''}: SectionCardProps) => (
  <View className={`rounded-[20px] border border-slate-200 bg-white p-5 ${className}`}>
    {!!label && (
      <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </Text>
    )}
    {children}
  </View>
);

export default SectionCard;
