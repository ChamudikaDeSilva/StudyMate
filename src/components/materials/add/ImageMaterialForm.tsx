import React from 'react';
import AppButton from '../../common/AppButton';
import AppInput from '../../common/AppInput';
import MaterialFormCard from '../MaterialFormCard';
import MediaPreviewCard from '../MediaPreviewCard';
import SelectFileButton from '../SelectFileButton';
import { PickedImage } from '../../../services/storage/ImagePickerService';
import { formatFileSize } from '../../../utils/fileUtils';
import { materialPresentation } from '../../../constants/materialPresentation';

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
    <MaterialFormCard title="Add a study image">
      {selectedImage ? (
        <>
          <MediaPreviewCard
            image={selectedImage}
            details={formatFileSize(selectedImage.size)}
            onRemove={onRemove}
            disabled={busy}
          />
          <AppButton
            title="Choose another image"
            variant="ghost"
            disabled={busy}
            onPress={onChoose}
            className="mb-5"
          />
        </>
      ) : (
        <SelectFileButton
          title="Choose image"
          description="Images up to 10 MB from your gallery."
          icon={materialPresentation.image.icon}
          color={materialPresentation.image.foreground}
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
        onPress={onSave}
        loading={saving}
        disabled={busy || !title.trim() || !selectedImage}
      />
    </MaterialFormCard>
  );
};

export default ImageMaterialForm;
