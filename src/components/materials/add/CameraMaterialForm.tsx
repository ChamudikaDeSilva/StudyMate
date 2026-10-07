import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {Camera, RotateCcw} from 'lucide-react-native';
import AppButton from '../../common/AppButton';
import AppInput from '../../common/AppInput';
import MaterialFormCard from '../MaterialFormCard';
import MediaPreviewCard from '../MediaPreviewCard';
import SelectFileButton from '../SelectFileButton';
import {PickedImage} from '../../../services/storage/ImagePickerService';
import {formatFileSize} from '../../../utils/fileUtils';

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
    <MaterialFormCard title="Camera material">
      {capturedImage ? (
        <>
          <MediaPreviewCard
            image={capturedImage}
            details={formatFileSize(capturedImage.size)}
            onRemove={onRemove}
          />
          <Pressable
            disabled={busy}
            onPress={onRetake}
            className="mb-5 min-h-[48px] flex-row items-center justify-center rounded-xl border border-green-200 bg-green-50">
            <RotateCcw size={18} color="#15803D" />
            <Text className="ml-2 font-bold text-green-700">Retake photo</Text>
          </Pressable>
        </>
      ) : (
        <SelectFileButton
          title="Open camera"
          color="#16A34A"
          loading={capturing}
          disabled={busy}
          onPress={onCapture}
        />
      )}

      <View className="mb-1 flex-row items-center">
        <Camera size={16} color="#16A34A" />
        <Text className="ml-2 text-xs font-semibold text-green-700">
          Native camera capture
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
        tone="success"
        onPress={onSave}
        loading={saving}
        disabled={busy || !title.trim() || !capturedImage}
      />
    </MaterialFormCard>
  );
};

export default CameraMaterialForm;
