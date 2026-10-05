import React from 'react';

import {
  ScrollView,
} from 'react-native';

import {
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Type,
} from 'lucide-react-native';

import {
  MaterialFilter,
} from '../../hooks/useSubjectMaterialsScreen';

import MaterialFilterChip
  from './MaterialFilterChip';


interface MaterialFiltersProps {

  activeFilter:
    MaterialFilter;

  onChange:
    (
      filter:
        MaterialFilter,
    ) => void;
}


const MaterialFilters = ({
  activeFilter,
  onChange,
}: MaterialFiltersProps) => {

  return (

    <ScrollView
      horizontal

      showsHorizontalScrollIndicator={
        false
      }>

      <MaterialFilterChip
        label="All"

        selected={
          activeFilter ===
          'all'
        }

        icon={
          CheckCircle2
        }

        color="#4F46E5"

        background="#EEF2FF"

        onPress={() =>
          onChange(
            'all',
          )
        }
      />


      <MaterialFilterChip
        label="Text"

        selected={
          activeFilter ===
          'text'
        }

        icon={
          Type
        }

        color="#4F46E5"

        background="#EEF2FF"

        onPress={() =>
          onChange(
            'text',
          )
        }
      />


      <MaterialFilterChip
        label="PDF"

        selected={
          activeFilter ===
          'pdf'
        }

        icon={
          FileText
        }

        color="#E11D48"

        background="#FFF1F2"

        onPress={() =>
          onChange(
            'pdf',
          )
        }
      />


      <MaterialFilterChip
        label="Image"

        selected={
          activeFilter ===
          'image'
        }

        icon={
          ImageIcon
        }

        color="#0284C7"

        background="#E0F2FE"

        onPress={() =>
          onChange(
            'image',
          )
        }
      />

    </ScrollView>
  );
};


export default MaterialFilters;