import React, {useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ScreenHeader from '../../components/common/ScreenHeader';
import MaterialSourceCard from '../../components/materials/MaterialSourceCard';
import CameraMaterialForm from '../../components/materials/add/CameraMaterialForm';
import ImageMaterialForm from '../../components/materials/add/ImageMaterialForm';
import PdfMaterialForm from '../../components/materials/add/PdfMaterialForm';
import TextMaterialForm from '../../components/materials/add/TextMaterialForm';
import {MaterialSourceType} from '../../domain/models/Material';
import {useMaterials} from '../../hooks/useMaterials';
import {SubjectsStackParamList} from '../../navigation/navigationTypes';
import {ImagePickerService, PickedImage} from '../../services/storage/ImagePickerService';
import {PdfPickerService, PickedPdf} from '../../services/storage/PdfPickerService';
import {cleanFileTitle, createCameraMaterialTitle} from '../../utils/fileUtils';

type Props = NativeStackScreenProps<SubjectsStackParamList, 'AddMaterial'>;
type SelectedSource = MaterialSourceType | null;

const pdfPickerService = new PdfPickerService();
const imagePickerService = new ImagePickerService();

const MAX_PDF_SIZE = 20 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const AddMaterialScreen = ({navigation, route}: Props) => {
  const {subjectId, subjectName} = route.params;
  const {
    createTextMaterial,
    createPdfMaterial,
    createImageMaterial,
    creating,
  } = useMaterials(subjectId);

  const [selectedSource, setSelectedSource] = useState<SelectedSource>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<PickedPdf | null>(null);
  const [selectedImage, setSelectedImage] = useState<PickedImage | null>(null);
  const [capturedImage, setCapturedImage] = useState<PickedImage | null>(null);
  const [pickingPdf, setPickingPdf] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const busy = creating || pickingPdf || pickingImage || capturing || uploading;
  const saving = creating || uploading;

  const resetMaterialData = () => {
    setTitle('');
    setContent('');
    setSelectedPdf(null);
    setSelectedImage(null);
    setCapturedImage(null);
  };

  const chooseSource = (source: MaterialSourceType) => {
    if (busy) return;
    resetMaterialData();
    setSelectedSource(source);
  };

  const handleSelectText = () => chooseSource('text');

  const handleSelectPdf = async () => {
    if (busy) return;
    if (selectedSource !== 'pdf') {
      resetMaterialData();
      setSelectedSource('pdf');
    }

    try {
      setPickingPdf(true);
      const pdf = await pdfPickerService.pickPdf();
      if (!pdf) return;

      if (pdf.size !== undefined && pdf.size > MAX_PDF_SIZE) {
        Alert.alert('PDF too large', 'Please select a PDF smaller than 20 MB.');
        return;
      }

      setSelectedPdf(pdf);
      setTitle(cleanFileTitle(pdf.fileName));
    } catch (error) {
      Alert.alert(
        'Unable to select PDF',
        error instanceof Error ? error.message : 'Unable to select PDF.',
      );
    } finally {
      setPickingPdf(false);
    }
  };

  const handleSelectImage = async () => {
    if (busy) return;
    if (selectedSource !== 'image') {
      resetMaterialData();
      setSelectedSource('image');
    }

    try {
      setPickingImage(true);
      const image = await imagePickerService.pickImage();
      if (!image) return;

      if (image.size !== undefined && image.size > MAX_IMAGE_SIZE) {
        Alert.alert('Image too large', 'Please select an image smaller than 10 MB.');
        return;
      }

      setSelectedImage(image);
      setTitle(cleanFileTitle(image.fileName));
    } catch (error) {
      Alert.alert(
        'Unable to select image',
        error instanceof Error ? error.message : 'Unable to select image.',
      );
    } finally {
      setPickingImage(false);
    }
  };

  const handleCapturePhoto = async () => {
    if (busy) return;
    if (selectedSource !== 'camera') {
      resetMaterialData();
      setSelectedSource('camera');
    }

    try {
      setCapturing(true);
      const image = await imagePickerService.captureImage();
      if (!image) return;

      if (image.size !== undefined && image.size > MAX_IMAGE_SIZE) {
        Alert.alert('Photo too large', 'Please capture a photo smaller than 10 MB.');
        return;
      }

      setCapturedImage(image);
      setTitle(createCameraMaterialTitle());
    } catch (error) {
      Alert.alert(
        'Unable to use camera',
        error instanceof Error ? error.message : 'Unable to capture a photo.',
      );
    } finally {
      setCapturing(false);
    }
  };

  const handleRetakePhoto = async () => {
    if (busy) return;
    setCapturedImage(null);
    await handleCapturePhoto();
  };

  const saveText = async () => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle || !cleanContent) return;

    try {
      await createTextMaterial(cleanTitle, cleanContent);
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Unable to save material',
        error instanceof Error ? error.message : 'Unable to save material.',
      );
    }
  };

  const savePdf = async () => {
    if (!selectedPdf || !title.trim()) return;

    try {
      setUploading(true);
      await createPdfMaterial(
        title.trim(),
        selectedPdf.localUri,
        selectedPdf.fileName,
        'application/pdf',
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Unable to upload PDF',
        error instanceof Error ? error.message : 'Unable to upload PDF.',
      );
    } finally {
      setUploading(false);
    }
  };

  const saveImage = async () => {
    if (!selectedImage || !title.trim()) return;

    try {
      setUploading(true);
      await createImageMaterial(
        title.trim(),
        selectedImage.localUri,
        selectedImage.fileName,
        selectedImage.mimeType,
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Unable to upload image',
        error instanceof Error ? error.message : 'Unable to upload image.',
      );
    } finally {
      setUploading(false);
    }
  };

  const saveCameraPhoto = async () => {
    if (!capturedImage || !title.trim()) return;

    try {
      setUploading(true);
      await createImageMaterial(
        title.trim(),
        capturedImage.localUri,
        capturedImage.fileName,
        capturedImage.mimeType,
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Unable to upload photo',
        error instanceof Error ? error.message : 'Unable to upload the captured photo.',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{paddingBottom: 40}}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View className="px-6 pt-6">
            <ScreenHeader
              title="Add material"
              subtitle={subjectName}
              onBack={() => navigation.goBack()}
            />

            <Text className="text-xl font-bold text-slate-900">Choose a source</Text>
            <Text className="mb-6 mt-2 text-sm text-slate-500">
              Add notes, PDFs, images or capture study material.
            </Text>

            <MaterialSourceCard
              sourceType="text"
              description="Write or paste study notes."
              selected={selectedSource === 'text'}
              disabled={busy}
              onPress={handleSelectText}
            />
            <MaterialSourceCard
              sourceType="pdf"
              description="Upload a PDF from your device."
              selected={selectedSource === 'pdf'}
              disabled={busy}
              loading={pickingPdf}
              onPress={handleSelectPdf}
            />
            <MaterialSourceCard
              sourceType="image"
              description="Choose an image from your gallery."
              selected={selectedSource === 'image'}
              disabled={busy}
              loading={pickingImage}
              onPress={handleSelectImage}
            />
            <MaterialSourceCard
              sourceType="camera"
              description="Capture study material using your camera."
              selected={selectedSource === 'camera'}
              disabled={busy}
              loading={capturing}
              onPress={handleCapturePhoto}
            />

            <View className="mt-4">
              {selectedSource === 'text' && (
                <TextMaterialForm
                  title={title}
                  content={content}
                  busy={busy}
                  saving={creating}
                  onTitleChange={setTitle}
                  onContentChange={setContent}
                  onSave={saveText}
                />
              )}

              {selectedSource === 'pdf' && (
                <PdfMaterialForm
                  title={title}
                  selectedPdf={selectedPdf}
                  busy={busy}
                  picking={pickingPdf}
                  saving={saving}
                  onTitleChange={setTitle}
                  onChoose={handleSelectPdf}
                  onRemove={() => {
                    setSelectedPdf(null);
                    setTitle('');
                  }}
                  onSave={savePdf}
                />
              )}

              {selectedSource === 'image' && (
                <ImageMaterialForm
                  title={title}
                  selectedImage={selectedImage}
                  busy={busy}
                  picking={pickingImage}
                  saving={saving}
                  onTitleChange={setTitle}
                  onChoose={handleSelectImage}
                  onRemove={() => {
                    setSelectedImage(null);
                    setTitle('');
                  }}
                  onSave={saveImage}
                />
              )}

              {selectedSource === 'camera' && (
                <CameraMaterialForm
                  title={title}
                  capturedImage={capturedImage}
                  busy={busy}
                  capturing={capturing}
                  saving={saving}
                  onTitleChange={setTitle}
                  onCapture={handleCapturePhoto}
                  onRetake={handleRetakePhoto}
                  onRemove={() => {
                    setCapturedImage(null);
                    setTitle('');
                  }}
                  onSave={saveCameraPhoto}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddMaterialScreen;
