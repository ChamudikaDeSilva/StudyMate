import React from 'react';
import { View } from 'react-native';
import { MaterialSourceType } from '../../domain/models/Material';

import { SelectedMaterialSource } from '../../hooks/useAddMaterialScreen';

import MaterialSourceCard from './MaterialSourceCard';

interface MaterialSourceSelectorProps {
  selectedSource: SelectedMaterialSource;

  busy: boolean;

  pickingPdf: boolean;

  pickingImage: boolean;

  capturing: boolean;

  onSelectText: () => void;

  onSelectPdf: () => void;

  onSelectImage: () => void;

  onCapture: () => void;
}

const MaterialSourceSelector = ({
  selectedSource,

  busy,

  pickingPdf,

  pickingImage,

  capturing,

  onSelectText,

  onSelectPdf,

  onSelectImage,

  onCapture,
}: MaterialSourceSelectorProps) => {
  const sources: {
    type: MaterialSourceType;
    description: string;
    loading?: boolean;
    onPress: () => void;
  }[] = [
    {
      type: 'text',
      description: 'Write or paste your notes.',
      onPress: onSelectText,
    },
    {
      type: 'pdf',
      description: 'Bring in a PDF document.',
      loading: pickingPdf,
      onPress: onSelectPdf,
    },
    {
      type: 'image',
      description: 'Choose a study image.',
      loading: pickingImage,
      onPress: onSelectImage,
    },
    {
      type: 'camera',
      description: 'Capture a page or notes.',
      loading: capturing,
      onPress: onCapture,
    },
  ];

  return (
    <View className="-mx-1.5 flex-row flex-wrap">
      {sources.map(source => (
        <View key={source.type} className="mb-3 w-1/2 px-1.5">
          <MaterialSourceCard
            sourceType={source.type}
            description={source.description}
            selected={selectedSource === source.type}
            disabled={busy}
            loading={source.loading}
            onPress={source.onPress}
          />
        </View>
      ))}
    </View>
  );
};

export default MaterialSourceSelector;
