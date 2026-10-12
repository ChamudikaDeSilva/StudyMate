import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { materialPresentation } from '../../constants/materialPresentation';
import { Material } from '../../domain/models/Material';
import { colors } from '../../constants/colors';
import { shadows } from '../../constants/shadows';

interface MaterialCardProps {
  material: Material;
  onPress?: () => void;
}

const MaterialCard = ({ material, onPress }: MaterialCardProps) => {
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
      className="mb-3 flex-row items-center rounded-[24px] border border-line bg-white p-4 active:opacity-75 active:scale-[0.99]"
      style={shadows.sm}
    >
      <View
        className="mr-4 h-[54px] w-[54px] items-center justify-center rounded-[16px]"
        style={{ backgroundColor: config.background }}
      >
        <Icon size={23} color={config.foreground} strokeWidth={2.1} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-ink" numberOfLines={2}>
          {material.title}
        </Text>
        <Text
          className="mt-1.5 text-xs leading-[18px] text-muted"
          numberOfLines={2}
        >
          {preview}
        </Text>
        <View className="mt-2 flex-row items-center">
          <View
            className="rounded-full px-2 py-1"
            style={{ backgroundColor: config.background }}
          >
            <Text
              className="text-[11px] font-semibold"
              style={{ color: config.foreground }}
            >
              {config.label}
            </Text>
          </View>
        </View>
      </View>

      <View className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-canvas">
        <ChevronRight size={18} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
};

export default MaterialCard;
