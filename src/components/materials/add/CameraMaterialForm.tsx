import React from 'react';
import { Text, View } from 'react-native';
import { Camera, RotateCcw } from 'lucide-react-native';
import AppButton from '../../common/AppButton';
import AppInput from '../../common/AppInput';
import MaterialFormCard from '../MaterialFormCard';
import MediaPreviewCard from '../MediaPreviewCard';
import SelectFileButton from '../SelectFileButton';
import { PickedImage } from '../../../services/storage/ImagePickerService';
import { formatFileSize } from '../../../utils/fileUtils';
import { materialPresentation } from '../../../constants/materialPresentation';

interface CameraMaterialFormProps {
  title: string;
  capturedImage: PickedImage | null;
  busy: boolean;
  capturing: boolean;
  saving: boolean;
  onTitleChange: (value: string) => void;
  onCapture: () => void;
  onRetake: () => void;
  onRemove: () => void;
  onSave: () => void;
}

const CameraMaterialForm = ({
  title,
  capturedImage,
  busy,
  capturing,
  saving,
  onTitleChange,
  onCapture,
  onRetake,
  onRemove,
  onSave,
}: CameraMaterialFormProps) => {
  return (
    <MaterialFormCard title="Capture your notes">
      {capturedImage ? (
        <>
          <MediaPreviewCard
            image={capturedImage}
            details={formatFileSize(capturedImage.size)}
            onRemove={onRemove}
            disabled={busy}
          />
          <AppButton
            title="Retake photo"
            variant="soft"
            tone="success"
            icon={
              <RotateCcw
                size={18}
                color={materialPresentation.camera.foreground}
              />
            }
            disabled={busy}
            onPress={onRetake}
            className="mb-5"
          />
        </>
      ) : (
        <SelectFileButton
          title="Open camera"
          description="Photograph a page or your written notes."
          icon={Camera}
          color={materialPresentation.camera.foreground}
          loading={capturing}
          disabled={busy}
          onPress={onCapture}
        />
      )}

      <View className="mb-4 flex-row items-center">
        <Camera size={16} color={materialPresentation.camera.foreground} />
        <Text className="ml-2 text-xs text-muted">
          Keep the page well lit and in focus.
        </Text>
      </View>

      <AppInput
        label="Title"
        value={title}
        onChangeText={onTitleChange}
        editable={!busy && !!capturedImage}
        placeholder="Camera material title"
      />

      <AppButton
        title="Save camera photo"
        onPress={onSave}
        loading={saving}
        disabled={busy || !title.trim() || !capturedImage}
      />
    </MaterialFormCard>
  );
};

export default CameraMaterialForm;
