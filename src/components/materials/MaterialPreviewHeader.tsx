import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {ArrowLeft} from 'lucide-react-native';
import {materialPresentation} from '../../constants/materialPresentation';
import {MaterialSourceType} from '../../domain/models/Material';

interface MaterialPreviewHeaderProps {
  title: string;
  subjectName: string;
  sourceType: Extract<MaterialSourceType, 'pdf' | 'image' | 'camera'>;
  onBack: () => void;
}

const MaterialPreviewHeader = ({
  title,
  subjectName,
  sourceType,
  onBack,
}: MaterialPreviewHeaderProps) => {
  const config = materialPresentation[sourceType];
  const Icon = config.icon;

  return (
    <View className="flex-row items-center border-b border-slate-200 bg-white px-5 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        className="mr-3 h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white"
        style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}>
        <ArrowLeft size={22} color="#0F172A" />
      </Pressable>

      <View
        className="mr-3 h-11 w-11 items-center justify-center rounded-xl"
        style={{backgroundColor: config.background}}>
        <Icon size={21} color={config.foreground} />
      </View>

      <View className="flex-1">
        <Text numberOfLines={1} className="text-base font-bold text-slate-900">
          {title}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-xs text-slate-500">
          {subjectName}
        </Text>
      </View>
    </View>
  );
};

export default MaterialPreviewHeader;
