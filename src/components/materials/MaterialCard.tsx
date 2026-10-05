import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import {materialPresentation} from '../../constants/materialPresentation';
import {Material} from '../../domain/models/Material';

interface MaterialCardProps {
  material: Material;
  onPress?: () => void;
}

const MaterialCard = ({material, onPress}: MaterialCardProps) => {
  const config = materialPresentation[material.sourceType];
  const Icon = config.icon;
  const preview =
    material.content?.trim() ||
    material.fileName ||
    'Open this material to view its contents.';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${material.title}`}
      onPress={onPress}
      className="mb-4 flex-row items-center rounded-[20px] border border-slate-200 bg-white p-4"
      style={({pressed}) => ({
        opacity: pressed ? 0.8 : 1,
        transform: [{scale: pressed ? 0.99 : 1}],
      })}>
      <View
        className="mr-4 h-[54px] w-[54px] items-center justify-center rounded-[16px]"
        style={{backgroundColor: config.background}}>
        <Icon size={23} color={config.foreground} strokeWidth={2.1} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
          {material.title}
        </Text>
        <Text className="mt-1 text-xs leading-[18px] text-slate-500" numberOfLines={2}>
          {preview}
        </Text>
        <View className="mt-2 flex-row items-center">
          <View
            className="rounded-full px-2 py-1"
            style={{backgroundColor: config.background}}>
            <Text className="text-[11px] font-semibold" style={{color: config.foreground}}>
              {config.label}
            </Text>
          </View>
        </View>
      </View>

      <ChevronRight size={20} color="#94A3B8" />
    </Pressable>
  );
};

export default MaterialCard;
