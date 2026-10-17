import React from 'react';

import { StyleSheet, View } from 'react-native';

import { Save, X } from 'lucide-react-native';

import { Material } from '../../domain/models/Material';
import { colors } from '../../constants/colors';

import AppButton from '../common/AppButton';

import AppInput from '../common/AppInput';

import SectionCard from '../common/SectionCard';

interface MaterialEditFormProps {
  material: Material;

  title: string;

  content: string;

  busy: boolean;

  isUpdating: boolean;

  onTitleChange: (value: string) => void;

  onContentChange: (value: string) => void;

  onCancel: () => void;

  onSave: () => void;
}

const MaterialEditForm = ({
  material,

  title,

  content,

  busy,

  isUpdating,

  onTitleChange,

  onContentChange,

  onCancel,

  onSave,
}: MaterialEditFormProps) => {
  const saveDisabled =
    busy ||
    !title.trim() ||
    (material.sourceType === 'text' && !content.trim());

  return (
    <SectionCard label="Edit material">
      <AppInput
        label="Title"
        value={title}
        onChangeText={onTitleChange}
        editable={!busy}
        maxLength={200}
        placeholder="Material title"
        helperText={material.sourceType !== 'text'
          ? 'Update the title in your library. The attached file stays the same.'
          : undefined}
      />

      {material.sourceType === 'text' && (
        <AppInput
          label="Study notes"
          value={content}
          onChangeText={onContentChange}
          editable={!busy}
          multiline
          textAlignVertical="top"
          placeholder="Study content"
          style={styles.notes}
        />
      )}

      <View className="flex-row">
        <AppButton
          title="Cancel"
          icon={<X size={18} color={colors.textSecondary} />}
          variant="outline"
          tone="neutral"
          disabled={busy}
          onPress={onCancel}
          className="mr-3 flex-1"
        />

        <AppButton
          title="Save"
          icon={<Save size={18} color="#FFFFFF" />}
          loading={isUpdating}
          disabled={saveDisabled}
          onPress={onSave}
          className="flex-1"
        />
      </View>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  notes: { minHeight: 220 },
});

export default MaterialEditForm;
