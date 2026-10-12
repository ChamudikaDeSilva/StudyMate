import React from 'react';
import { Text, View } from 'react-native';
import BackButton from '../common/BackButton';
import { materialPresentation } from '../../constants/materialPresentation';
import { MaterialSourceType } from '../../domain/models/Material';
import { colors } from '../../constants/colors';

interface MaterialPreviewHeaderProps {
  title: string;
  subjectName: string;
  sourceType: Extract<MaterialSourceType, 'pdf' | 'image' | 'camera'>;
  onBack: () => void;
  tone?: 'light' | 'dark';
}

const MaterialPreviewHeader = ({
  title,
  subjectName,
  sourceType,
  onBack,
  tone = 'light',
}: MaterialPreviewHeaderProps) => {
  const config = materialPresentation[sourceType];
  const Icon = config.icon;
  const dark = tone === 'dark';
  const iconBackground = dark ? colors.darkSurface : config.background;
  const iconColor = dark ? colors.primarySoft : config.foreground;
  const backgroundColor = dark ? colors.darkBackground : colors.surface;

  return (
    <View
      style={{ backgroundColor }}
      className={`flex-row items-center border-b px-5 py-3 ${
        dark ? 'border-white/10' : 'border-line'
      }`}
    >
      <View className="mr-3">
        <BackButton onPress={onBack} tone={tone} />
      </View>
      <View
        className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
        style={{ backgroundColor: iconBackground }}
      >
        <Icon size={21} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className={`text-base font-bold ${dark ? 'text-white' : 'text-ink'}`}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          className={`mt-1 text-xs ${dark ? 'text-brand-200' : 'text-muted'}`}
        >
          {subjectName}
        </Text>
      </View>
    </View>
  );
};

export default MaterialPreviewHeader;
