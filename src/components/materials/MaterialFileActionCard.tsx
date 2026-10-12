import React from 'react';
import { Text, View } from 'react-native';
import { Eye, LucideIcon } from 'lucide-react-native';
import AppButton from '../common/AppButton';
import SectionCard from '../common/SectionCard';

interface MaterialFileActionCardProps {
  label: string;
  fileName: string;
  icon: LucideIcon;
  color: string;
  background: string;
  actionTitle: string;
  disabled?: boolean;
  onPreview: () => void;
}

const MaterialFileActionCard = ({
  label,
  fileName,
  icon: Icon,
  color,
  background,
  actionTitle,
  disabled = false,
  onPreview,
}: MaterialFileActionCardProps) => (
  <SectionCard className="mb-5">
    <View className="flex-row items-center">
      <View
        className="mr-3 h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: background }}
      >
        <Icon size={22} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-muted">
          {label}
        </Text>
        <Text numberOfLines={2} className="mt-1.5 text-base font-bold text-ink">
          {fileName}
        </Text>
      </View>
    </View>

    <AppButton
      title={actionTitle}
      icon={<Eye size={18} color="#FFFFFF" />}
      tone="primary"
      disabled={disabled}
      onPress={onPreview}
      className="mt-5"
    />
  </SectionCard>
);

export default MaterialFileActionCard;
