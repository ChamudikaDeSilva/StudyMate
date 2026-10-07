import React, {ReactNode} from 'react';
import {Text, View} from 'react-native';

interface MaterialFormCardProps {
  title: string;
  children: ReactNode;
}

const MaterialFormCard = ({title, children}: MaterialFormCardProps) => {
  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-5">
      <Text className="mb-6 text-lg font-bold text-slate-900">{title}</Text>
      {children}
    </View>
  );
};

export default MaterialFormCard;
