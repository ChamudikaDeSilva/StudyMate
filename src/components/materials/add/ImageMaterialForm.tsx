import React from 'react';
import {Pressable, Text} from 'react-native';
import AppButton from '../../common/AppButton';
import AppInput from '../../common/AppInput';
import MaterialFormCard from '../MaterialFormCard';
import MediaPreviewCard from '../MediaPreviewCard';
import SelectFileButton from '../SelectFileButton';
import {PickedImage} from '../../../services/storage/ImagePickerService';
import {formatFileSize} from '../../../utils/fileUtils';

interface ImageMaterialFormProps {
  title: string;
  selectedImage: PickedImage | null;
  busy: boolean;
  picking: boolean;
  saving: boolean;
  onTitleChange: (value: string) => void;
  onChoose: () => void;
  onRemove: () => void;
  onSave: () => void;
}

const ImageMaterialForm = ({
  title,
  selectedImage,
  busy,
  picking,
  saving,
  onTitleChange,
  onChoose,
  onRemove,
  onSave,
}: ImageMaterialFormProps) => {
  return (
    <MaterialFormCard title="Image material">
      {selectedImage ? (
        <>
          <MediaPreviewCard
            image={selectedImage}
            details={formatFileSize(selectedImage.size)}
            onRemove={onRemove}
          />
          <Pressable disabled={busy} onPress={onChoose} className="mb-5 self-start">
            <Text className="font-semibold text-sky-600">Choose another image</Text>
          </Pressable>
        </>
      ) : (
        <SelectFileButton
          title="Choose image"
          color="#0284C7"
          loading={picking}
          disabled={busy}
          onPress={onChoose}
        />
      )}

      <AppInput
        label="Title"
        value={title}
        onChangeText={onTitleChange}
        editable={!busy}
        placeholder="Material title"
      />

      <AppButton
        title="Save image"
        tone="info"
        onPress={onSave}
        loading={saving}
        disabled={busy || !title.trim() || !selectedImage}
      />
    </MaterialFormCard>
  );
};

export default ImageMaterialForm;
