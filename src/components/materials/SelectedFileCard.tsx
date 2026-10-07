import React, {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import {X} from 'lucide-react-native';

interface SelectedFileCardProps {
  icon: ReactNode;
  name: string;
  details: string;
  onRemove: () => void;
}

const SelectedFileCard = ({icon, name, details, onRemove}: SelectedFileCardProps) => {
  return (
    <View className="mb-5 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-white">
        {icon}
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="font-bold text-slate-900">{name}</Text>
        <Text className="mt-1 text-xs text-slate-500">{details}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove file"
        onPress={onRemove}
        className="h-9 w-9 items-center justify-center rounded-xl bg-white">
        <X size={17} color="#64748B" />
      </Pressable>
    </View>
  );
};

export default SelectedFileCard;
