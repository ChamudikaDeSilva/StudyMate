import React from 'react';
import {Text, View} from 'react-native';
import {Eye, LucideIcon} from 'lucide-react-native';
import AppButton from '../common/AppButton';

interface MaterialFileActionCardProps {
  label: string;
  fileName: string;
  icon: LucideIcon;
  color: string;
  background: string;
  actionTitle: string;
  tone: 'danger' | 'info' | 'success';
  onPreview: () => void;
}

const MaterialFileActionCard = ({
  label,
  fileName,
  icon: Icon,
  color,
  background,
  actionTitle,
  tone,
  onPreview,
}: MaterialFileActionCardProps) => (
  <View className="mb-4 rounded-[20px] border border-slate-200 bg-white p-5">
    <View className="flex-row items-center">
      <View
        className="mr-3 h-12 w-12 items-center justify-center rounded-xl"
        style={{backgroundColor: background}}>
        <Icon size={22} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-bold uppercase text-slate-400">{label}</Text>
        <Text numberOfLines={2} className="mt-1 font-bold text-slate-800">
          {fileName}
        </Text>
      </View>
    </View>

    <AppButton
      title={actionTitle}
      icon={<Eye size={18} color="#FFFFFF" />}
      tone={tone}
      onPress={onPreview}
      className="mt-5"
    />
  </View>
);

export default MaterialFileActionCard;
