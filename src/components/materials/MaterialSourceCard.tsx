import React from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {CheckCircle2} from 'lucide-react-native';
import {materialPresentation} from '../../constants/materialPresentation';
import {MaterialSourceType} from '../../domain/models/Material';

interface MaterialSourceCardProps {
  sourceType: MaterialSourceType;
  description: string;
  selected: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

const MaterialSourceCard = ({
  sourceType,
  description,
  selected,
  disabled = false,
  loading = false,
  onPress,
}: MaterialSourceCardProps) => {
  const config = materialPresentation[sourceType];
  const Icon = config.icon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{selected, disabled}}
      disabled={disabled}
      onPress={onPress}
      className="mb-4 flex-row items-center rounded-[20px] border bg-white p-4"
      style={({pressed}) => ({
        borderColor: selected ? config.foreground : '#E2E8F0',
        opacity: disabled ? 0.6 : pressed ? 0.82 : 1,
      })}>
      <View
        className="mr-4 h-[54px] w-[54px] items-center justify-center rounded-[16px]"
        style={{backgroundColor: config.background}}>
        {loading ? (
          <ActivityIndicator color={config.foreground} />
        ) : (
          <Icon size={24} color={config.foreground} />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900">{config.label}</Text>
        <Text className="mt-1 text-xs text-slate-500">{description}</Text>
      </View>

      {selected && <CheckCircle2 size={21} color={config.foreground} />}
    </Pressable>
  );
};

export default MaterialSourceCard;
