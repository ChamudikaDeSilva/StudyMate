import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { materialPresentation } from '../../constants/materialPresentation';
import { MaterialSourceType } from '../../domain/models/Material';
import { colors } from '../../constants/colors';
import { shadows } from '../../constants/shadows';

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
      accessibilityLabel={config.label}
      accessibilityHint={description}
      accessibilityState={{ selected, disabled, busy: loading }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-[160px] flex-1 rounded-[24px] border p-4 ${
        disabled ? 'opacity-60' : 'active:opacity-75'
      }`}
      style={[
        shadows.sm,
        {
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primaryLight : colors.surface,
        },
      ]}
    >
      <View
        className="mb-3 h-11 w-11 items-center justify-center rounded-[14px]"
        style={{ backgroundColor: config.background }}
      >
        {loading ? (
          <ActivityIndicator color={config.foreground} />
        ) : (
          <Icon size={24} color={config.foreground} />
        )}
      </View>

      <View>
        <Text className="text-base font-bold text-ink">{config.label}</Text>
        <Text className="mt-1 text-xs leading-[18px] text-muted">
          {description}
        </Text>
      </View>

      {selected && (
        <View className="absolute right-3 top-3">
          <CheckCircle2 size={19} color={colors.primary} />
        </View>
      )}
    </Pressable>
  );
};

export default MaterialSourceCard;
