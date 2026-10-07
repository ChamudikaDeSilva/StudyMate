import React from 'react';
import {Text, View} from 'react-native';
import {LucideIcon} from 'lucide-react-native';

interface OverviewCardProps {
  kicker: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

const OverviewCard = ({
  kicker,
  value,
  description,
  icon: Icon,
}: OverviewCardProps) => {
  return (
    <View className="relative min-h-[145px] flex-row items-center overflow-hidden rounded-[22px] bg-indigo-600 p-6">
      <View className="absolute -right-8 -top-10 h-[120px] w-[120px] rounded-full bg-white/10" />
      <View className="absolute -bottom-10 right-8 h-[80px] w-[80px] rounded-full bg-white/10" />

      <View className="z-10 mr-4 h-[54px] w-[54px] items-center justify-center rounded-2xl bg-white/15">
        <Icon size={24} color="#FFFFFF" />
      </View>

      <View className="z-10 flex-1">
        <Text className="text-[10px] font-bold tracking-widest text-indigo-200">
          {kicker}
        </Text>
        <Text className="mt-1 text-[32px] font-extrabold text-white">{value}</Text>
        <Text className="mt-1 text-xs leading-[17px] text-indigo-100">
          {description}
        </Text>
      </View>
    </View>
  );
};

export default OverviewCard;
