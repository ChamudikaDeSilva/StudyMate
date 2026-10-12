import React from 'react';
import { StyleSheet } from 'react-native';
import AppButton from '../../common/AppButton';
import AppInput from '../../common/AppInput';
import MaterialFormCard from '../MaterialFormCard';

interface TextMaterialFormProps {
  title: string;
  content: string;
  busy: boolean;
  saving: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSave: () => void;
}

const TextMaterialForm = ({
  title,
  content,
  busy,
  saving,
  onTitleChange,
  onContentChange,
  onSave,
}: TextMaterialFormProps) => {
  return (
    <MaterialFormCard title="Write your notes">
      <AppInput
        label="Title"
        value={title}
        onChangeText={onTitleChange}
        editable={!busy}
        placeholder="Material title"
      />

      <AppInput
        label="Study notes"
        value={content}
        onChangeText={onContentChange}
        editable={!busy}
        multiline
        textAlignVertical="top"
        placeholder="Write or paste your notes..."
        style={styles.notes}
      />

      <AppButton
        title="Save material"
        onPress={onSave}
        loading={saving}
        disabled={busy || !title.trim() || !content.trim()}
      />
    </MaterialFormCard>
  );
};

const styles = StyleSheet.create({
  notes: { minHeight: 220 },
});

export default TextMaterialForm;
