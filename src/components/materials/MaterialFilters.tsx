import React from 'react';

import { ScrollView } from 'react-native';

import { Layers3 } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { materialPresentation } from '../../constants/materialPresentation';

import { MaterialFilter } from '../../hooks/useSubjectMaterialsScreen';

import MaterialFilterChip from './MaterialFilterChip';

interface MaterialFiltersProps {
  activeFilter: MaterialFilter;

  onChange: (filter: MaterialFilter) => void;
}

const MaterialFilters = ({ activeFilter, onChange }: MaterialFiltersProps) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <MaterialFilterChip
        label="All"
        selected={activeFilter === 'all'}
        icon={Layers3}
        color={colors.primary}
        background={colors.primaryLight}
        onPress={() => onChange('all')}
      />

      <MaterialFilterChip
        label="Text"
        selected={activeFilter === 'text'}
        icon={materialPresentation.text.icon}
        color={materialPresentation.text.foreground}
        background={materialPresentation.text.background}
        onPress={() => onChange('text')}
      />

      <MaterialFilterChip
        label="PDF"
        selected={activeFilter === 'pdf'}
        icon={materialPresentation.pdf.icon}
        color={materialPresentation.pdf.foreground}
        background={materialPresentation.pdf.background}
        onPress={() => onChange('pdf')}
      />

      <MaterialFilterChip
        label="Image"
        selected={activeFilter === 'image'}
        icon={materialPresentation.image.icon}
        color={materialPresentation.image.foreground}
        background={materialPresentation.image.background}
        onPress={() => onChange('image')}
      />
    </ScrollView>
  );
};

export default MaterialFilters;
