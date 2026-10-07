import React from 'react';
import {FileText} from 'lucide-react-native';
import AppButton from '../../common/AppButton';
import AppInput from '../../common/AppInput';
import MaterialFormCard from '../MaterialFormCard';
import SelectFileButton from '../SelectFileButton';
import SelectedFileCard from '../SelectedFileCard';
import {PickedPdf} from '../../../services/storage/PdfPickerService';
import {formatFileSize} from '../../../utils/fileUtils';

interface PdfMaterialFormProps {
  title: string;
  selectedPdf: PickedPdf | null;
  busy: boolean;
  picking: boolean;
  saving: boolean;
  onTitleChange: (value: string) => void;
  onChoose: () => void;
  onRemove: () => void;
  onSave: () => void;
}

const PdfMaterialForm = ({
  title,
  selectedPdf,
  busy,
  picking,
  saving,
  onTitleChange,
  onChoose,
  onRemove,
  onSave,
}: PdfMaterialFormProps) => {
  return (
    <MaterialFormCard title="PDF material">
      {selectedPdf ? (
        <SelectedFileCard
          icon={<FileText size={22} color="#E11D48" />}
          name={selectedPdf.fileName}
          details={formatFileSize(selectedPdf.size)}
          onRemove={onRemove}
        />
      ) : (
        <SelectFileButton
          title="Choose PDF"
          color="#E11D48"
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
        title="Save PDF"
        tone="danger"
        onPress={onSave}
        loading={saving}
        disabled={busy || !title.trim() || !selectedPdf}
      />
    </MaterialFormCard>
  );
};

export default PdfMaterialForm;
