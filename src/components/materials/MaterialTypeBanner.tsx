import React from 'react';
import {Text, View} from 'react-native';
import {materialPresentation} from '../../constants/materialPresentation';
import {Material} from '../../domain/models/Material';

interface MaterialTypeBannerProps {
  material: Material;
}

const MaterialTypeBanner = ({material}: MaterialTypeBannerProps) => {
  const config = materialPresentation[material.sourceType];
  const Icon = config.icon;

  return (
    <View
      className="mb-6 flex-row items-center rounded-[20px] border p-4"
      style={{borderColor: config.border, backgroundColor: config.background}}>
      <View className="mr-4 h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white">
        <Icon size={23} color={config.foreground} />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Material type
        </Text>
        <Text className="mt-1 text-base font-bold text-slate-900">{config.label}</Text>
      </View>
      <View className="rounded-full bg-white px-3 py-1.5">
        <Text className="text-xs font-bold" style={{color: config.foreground}}>
          {material.syncStatus}
        </Text>
      </View>
    </View>
  );
};

export default MaterialTypeBanner;
