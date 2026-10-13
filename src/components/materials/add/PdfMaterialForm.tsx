import React from 'react';
import { FileText } from 'lucide-react-native';
import AppButton from '../../common/AppButton';
import AppInput from '../../common/AppInput';
import MaterialFormCard from '../MaterialFormCard';
import SelectFileButton from '../SelectFileButton';
import SelectedFileCard from '../SelectedFileCard';
import { PickedPdf } from '../../../services/storage/PdfPickerService';
import { formatFileSize } from '../../../utils/fileUtils';
import { materialPresentation } from '../../../constants/materialPresentation';

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
    <MaterialFormCard title="Upload a document">
      {selectedPdf ? (
        <SelectedFileCard
          icon={
            <FileText size={22} color={materialPresentation.pdf.foreground} />
          }
          name={selectedPdf.fileName}
          details={formatFileSize(selectedPdf.size)}
          onRemove={onRemove}
          disabled={busy}
        />
      ) : (
        <SelectFileButton
          title="Choose PDF"
          description="PDF documents up to 20 MB."
          color={materialPresentation.pdf.foreground}
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
        onPress={onSave}
        loading={saving}
        disabled={busy || !title.trim() || !selectedPdf}
      />
    </MaterialFormCard>
  );
};

export default PdfMaterialForm;
