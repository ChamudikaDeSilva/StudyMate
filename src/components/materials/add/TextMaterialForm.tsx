import React from 'react';
import {TextInput} from 'react-native';
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
    <MaterialFormCard title="Text material">
      <AppInput
        label="Title"
        value={title}
        onChangeText={onTitleChange}
        editable={!busy}
        placeholder="Material title"
      />

      <TextInput
        value={content}
        onChangeText={onContentChange}
        editable={!busy}
        multiline
        textAlignVertical="top"
        placeholder="Write or paste your notes..."
        placeholderTextColor="#94A3B8"
        className="mb-5 min-h-[220px] rounded-xl border border-slate-200 bg-white px-4 py-4 text-slate-900"
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

export default TextMaterialForm;
