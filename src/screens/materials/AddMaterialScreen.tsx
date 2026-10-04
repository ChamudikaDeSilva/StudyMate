import React, {
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Type,
  UploadCloud,
  X,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  useMaterials,
} from '../../hooks/useMaterials';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';

import {
  PdfPickerService,
  PickedPdf,
} from '../../services/storage/PdfPickerService';

import {
  ImagePickerService,
  PickedImage,
} from '../../services/storage/ImagePickerService';


type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'AddMaterial'
  >;


type SelectedSource =
  | 'text'
  | 'pdf'
  | 'image'
  | 'camera'
  | null;


const pdfPickerService =
  new PdfPickerService();


const imagePickerService =
  new ImagePickerService();


const MAX_PDF_SIZE =
  20 * 1024 * 1024;


const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;


const AddMaterialScreen = ({
  navigation,
  route,
}: Props) => {

  const {
    subjectId,
    subjectName,
  } = route.params;


  const {
    createMaterial,

    createPdfMaterial,

    createImageMaterial,

    creating,
  } = useMaterials(
    subjectId,
  );


  // =========================================================
  // State
  // =========================================================

  const [
    selectedSource,
    setSelectedSource,
  ] = useState<
    SelectedSource
  >(null);


  const [
    title,
    setTitle,
  ] = useState(
    '',
  );


  const [
    content,
    setContent,
  ] = useState(
    '',
  );


  const [
    selectedPdf,
    setSelectedPdf,
  ] = useState<
    PickedPdf | null
  >(null);


  const [
    selectedImage,
    setSelectedImage,
  ] = useState<
    PickedImage | null
  >(null);


  const [
    capturedImage,
    setCapturedImage,
  ] = useState<
    PickedImage | null
  >(null);


  const [
    pickingPdf,
    setPickingPdf,
  ] = useState(
    false,
  );


  const [
    pickingImage,
    setPickingImage,
  ] = useState(
    false,
  );


  const [
    capturing,
    setCapturing,
  ] = useState(
    false,
  );


  const [
    uploading,
    setUploading,
  ] = useState(
    false,
  );


  const busy =
    creating ||
    pickingPdf ||
    pickingImage ||
    capturing ||
    uploading;


  // =========================================================
  // Helpers
  // =========================================================

  const formatSize = (
    bytes?: number,
  ) => {

    if (
      bytes === undefined
    ) {
      return 'Unknown size';
    }


    if (
      bytes < 1024
    ) {
      return `${bytes} B`;
    }


    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }


    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };


  const cleanFileTitle = (
    fileName: string,
  ) => {

    return fileName
      .replace(
        /\.[^/.]+$/,
        '',
      )
      .replace(
        /[_-]+/g,
        ' ',
      )
      .trim();
  };


  const createCameraTitle =
    () => {

      const now =
        new Date();


      const date =
        now
          .toLocaleDateString();


      const time =
        now
          .toLocaleTimeString(
            [],
            {
              hour:
                '2-digit',

              minute:
                '2-digit',
            },
          );


      return (
        `Camera material ${date} ${time}`
      );
    };


  const resetSelections =
    () => {

      setSelectedPdf(
        null,
      );


      setSelectedImage(
        null,
      );


      setCapturedImage(
        null,
      );


      setContent(
        '',
      );


      setTitle(
        '',
      );
    };


  // =========================================================
  // Text
  // =========================================================

  const handleSelectText =
    () => {

      if (busy) {
        return;
      }


      resetSelections();


      setSelectedSource(
        'text',
      );
    };


  // =========================================================
  // PDF
  // =========================================================

  const handleSelectPdf =
    async () => {

      if (busy) {
        return;
      }


      setSelectedSource(
        'pdf',
      );


      setSelectedImage(
        null,
      );


      setCapturedImage(
        null,
      );


      setContent(
        '',
      );


      try {

        setPickingPdf(
          true,
        );


        const pdf =
          await pdfPickerService
            .pickPdf();


        if (!pdf) {
          return;
        }


        if (
          pdf.size !== undefined &&
          pdf.size >
          MAX_PDF_SIZE
        ) {

          Alert.alert(
            'PDF too large',
            'Please select a PDF smaller than 20 MB.',
          );

          return;
        }


        setSelectedPdf(
          pdf,
        );


        setTitle(
          cleanFileTitle(
            pdf.fileName,
          ),
        );

      } catch (
        pickerError
      ) {

        Alert.alert(
          'Unable to select PDF',

          pickerError instanceof Error
            ? pickerError.message
            : 'Unable to select PDF.',
        );

      } finally {

        setPickingPdf(
          false,
        );
      }
    };


  // =========================================================
  // Gallery Image
  // =========================================================

  const handleSelectImage =
    async () => {

      if (busy) {
        return;
      }


      setSelectedSource(
        'image',
      );


      setSelectedPdf(
        null,
      );


      setCapturedImage(
        null,
      );


      setContent(
        '',
      );


      try {

        setPickingImage(
          true,
        );


        const image =
          await imagePickerService
            .pickImage();


        if (!image) {
          return;
        }


        if (
          image.size !== undefined &&
          image.size >
          MAX_IMAGE_SIZE
        ) {

          Alert.alert(
            'Image too large',
            'Please select an image smaller than 10 MB.',
          );

          return;
        }


        setSelectedImage(
          image,
        );


        setTitle(
          cleanFileTitle(
            image.fileName,
          ),
        );

      } catch (
        pickerError
      ) {

        console.error(
          'Image picker error:',
          pickerError,
        );


        Alert.alert(
          'Unable to select image',

          pickerError instanceof Error
            ? pickerError.message
            : 'Unable to select image.',
        );

      } finally {

        setPickingImage(
          false,
        );
      }
    };


  // =========================================================
  // Camera
  // =========================================================

  const handleCapturePhoto =
    async () => {

      if (busy) {
        return;
      }


      setSelectedSource(
        'camera',
      );


      setSelectedPdf(
        null,
      );


      setSelectedImage(
        null,
      );


      setContent(
        '',
      );


      try {

        setCapturing(
          true,
        );


        const image =
          await imagePickerService
            .captureImage();


        if (!image) {

          return;
        }


        if (
          image.size !== undefined &&
          image.size >
          MAX_IMAGE_SIZE
        ) {

          Alert.alert(
            'Photo too large',
            'Please capture a photo smaller than 10 MB.',
          );

          return;
        }


        setCapturedImage(
          image,
        );


        setTitle(
          createCameraTitle(),
        );

      } catch (
        cameraError
      ) {

        console.error(
          'Camera error:',
          cameraError,
        );


        Alert.alert(
          'Unable to use camera',

          cameraError instanceof Error
            ? cameraError.message
            : 'Unable to capture a photo.',
        );

      } finally {

        setCapturing(
          false,
        );
      }
    };


  const handleRetakePhoto =
    async () => {

      if (busy) {
        return;
      }


      setCapturedImage(
        null,
      );


      await handleCapturePhoto();
    };


  // =========================================================
  // Save Text
  // =========================================================

  const handleSaveText =
    async () => {

      const trimmedTitle =
        title.trim();


      const trimmedContent =
        content.trim();


      if (!trimmedTitle) {

        Alert.alert(
          'Title required',
          'Please enter a title.',
        );

        return;
      }


      if (!trimmedContent) {

        Alert.alert(
          'Content required',
          'Please enter study content.',
        );

        return;
      }


      try {

        await createMaterial(
          trimmedTitle,
          'text',
          trimmedContent,
        );


        navigation.goBack();

      } catch (
        saveError
      ) {

        Alert.alert(
          'Unable to save material',

          saveError instanceof Error
            ? saveError.message
            : 'Unable to save material.',
        );
      }
    };


  // =========================================================
  // Save PDF
  // =========================================================

  const handleSavePdf =
    async () => {

      if (!selectedPdf) {

        Alert.alert(
          'PDF required',
          'Please select a PDF.',
        );

        return;
      }


      const trimmedTitle =
        title.trim();


      if (!trimmedTitle) {

        Alert.alert(
          'Title required',
          'Please enter a title.',
        );

        return;
      }


      try {

        setUploading(
          true,
        );


        await createPdfMaterial(
          trimmedTitle,

          selectedPdf.localUri,

          selectedPdf.fileName,

          'application/pdf',
        );


        navigation.goBack();

      } catch (
        uploadError
      ) {

        Alert.alert(
          'Unable to upload PDF',

          uploadError instanceof Error
            ? uploadError.message
            : 'Unable to upload PDF.',
        );

      } finally {

        setUploading(
          false,
        );
      }
    };


  // =========================================================
  // Save Gallery Image
  // =========================================================

  const handleSaveImage =
    async () => {

      if (!selectedImage) {

        Alert.alert(
          'Image required',
          'Please select an image.',
        );

        return;
      }


      const trimmedTitle =
        title.trim();


      if (!trimmedTitle) {

        Alert.alert(
          'Title required',
          'Please enter a title.',
        );

        return;
      }


      try {

        setUploading(
          true,
        );


        await createImageMaterial(
          trimmedTitle,

          selectedImage.localUri,

          selectedImage.fileName,

          selectedImage.mimeType,
        );


        navigation.goBack();

      } catch (
        uploadError
      ) {

        console.error(
          'Image upload error:',
          uploadError,
        );


        Alert.alert(
          'Unable to upload image',

          uploadError instanceof Error
            ? uploadError.message
            : 'Unable to upload image.',
        );

      } finally {

        setUploading(
          false,
        );
      }
    };


  // =========================================================
  // Save Camera Photo
  // =========================================================

  const handleSaveCameraPhoto =
    async () => {

      if (!capturedImage) {

        Alert.alert(
          'Photo required',
          'Please capture a photo first.',
        );

        return;
      }


      const trimmedTitle =
        title.trim();


      if (!trimmedTitle) {

        Alert.alert(
          'Title required',
          'Please enter a title.',
        );

        return;
      }


      try {

        setUploading(
          true,
        );


        // IMPORTANT:
        // Reusing the same proven Image
        // upload endpoint.

        await createImageMaterial(
          trimmedTitle,

          capturedImage.localUri,

          capturedImage.fileName,

          capturedImage.mimeType,
        );


        navigation.goBack();

      } catch (
        uploadError
      ) {

        console.error(
          'Camera photo upload error:',
          uploadError,
        );


        Alert.alert(
          'Unable to upload photo',

          uploadError instanceof Error
            ? uploadError.message
            : 'Unable to upload the captured photo.',
        );

      } finally {

        setUploading(
          false,
        );
      }
    };


  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom:
              180,
          }}
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled">

          <View
            className="
              px-6
              pt-6
            ">

            {/* =================================================
                HEADER
            ================================================== */}

            <View
              className="
                mb-8
                flex-row
                items-center
              ">

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                disabled={busy}
                onPress={() =>
                  navigation.goBack()
                }
                className="
                  mr-4
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                "
                style={({
                  pressed,
                }) => ({
                  opacity:
                    busy
                      ? 0.5
                      : pressed
                        ? 0.7
                        : 1,
                })}>

                <ArrowLeft
                  size={22}
                  color="#0F172A"
                />

              </Pressable>


              <View
                className="
                  flex-1
                ">

                <Text
                  className="
                    text-[26px]
                    font-bold
                    tracking-tight
                    text-slate-900
                  ">

                  Add material

                </Text>


                <Text
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  ">

                  {subjectName}

                </Text>

              </View>

            </View>


            {/* =================================================
                SOURCE TITLE
            ================================================== */}

            <Text
              className="
                text-xl
                font-bold
                text-slate-900
              ">

              Choose a source

            </Text>


            <Text
              className="
                mb-6
                mt-2
                text-sm
                text-slate-500
              ">

              Add notes, PDFs, images
              or capture study material.

            </Text>


            {/* =================================================
                TEXT
            ================================================== */}

            <SourceCard
              title="Text"
              description="Write or paste study notes."
              selected={
                selectedSource ===
                'text'
              }
              disabled={busy}
              color="#4F46E5"
              background="#EEF2FF"
              icon={
                <Type
                  size={24}
                  color="#4F46E5"
                />
              }
              onPress={
                handleSelectText
              }
            />


            {/* =================================================
                PDF
            ================================================== */}

            <SourceCard
              title="PDF"
              description="Upload a PDF from your device."
              selected={
                selectedSource ===
                'pdf'
              }
              disabled={busy}
              color="#E11D48"
              background="#FFF1F2"
              loading={
                pickingPdf
              }
              icon={
                <FileText
                  size={24}
                  color="#E11D48"
                />
              }
              onPress={
                handleSelectPdf
              }
            />


            {/* =================================================
                IMAGE
            ================================================== */}

            <SourceCard
              title="Image"
              description="Choose an image from your gallery."
              selected={
                selectedSource ===
                'image'
              }
              disabled={busy}
              color="#0284C7"
              background="#E0F2FE"
              loading={
                pickingImage
              }
              icon={
                <ImageIcon
                  size={24}
                  color="#0284C7"
                />
              }
              onPress={
                handleSelectImage
              }
            />


            {/* =================================================
                CAMERA
            ================================================== */}

            <SourceCard
              title="Camera"
              description="Capture study material using your camera."
              selected={
                selectedSource ===
                'camera'
              }
              disabled={busy}
              color="#16A34A"
              background="#F0FDF4"
              loading={
                capturing
              }
              icon={
                <Camera
                  size={24}
                  color="#16A34A"
                />
              }
              onPress={
                handleCapturePhoto
              }
            />


            {/* =================================================
                TEXT FORM
            ================================================== */}

            {selectedSource ===
              'text' && (

              <FormCard>

                <FormTitle>
                  Text material
                </FormTitle>


                <FieldLabel>
                  Title
                </FieldLabel>


                <TextInput
                  value={title}
                  onChangeText={
                    setTitle
                  }
                  editable={!busy}
                  placeholder="Material title"
                  placeholderTextColor="#94A3B8"
                  className="
                    mb-5
                    min-h-[52px]
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-slate-900
                  "
                />


                <FieldLabel>
                  Study content
                </FieldLabel>


                <TextInput
                  value={content}
                  onChangeText={
                    setContent
                  }
                  editable={!busy}
                  multiline
                  textAlignVertical="top"
                  placeholder="Write or paste your notes..."
                  placeholderTextColor="#94A3B8"
                  className="
                    min-h-[220px]
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-4
                    text-slate-900
                  "
                />


                <SaveButton
                  disabled={
                    busy ||
                    !title.trim() ||
                    !content.trim()
                  }
                  loading={
                    creating
                  }
                  title="Save material"
                  color="#4F46E5"
                  onPress={
                    handleSaveText
                  }
                />

              </FormCard>

            )}


            {/* =================================================
                PDF FORM
            ================================================== */}

            {selectedSource ===
              'pdf' && (

              <FormCard>

                <FormTitle>
                  PDF material
                </FormTitle>


                {selectedPdf ? (

                  <SelectedFile
                    icon={
                      <FileText
                        size={22}
                        color="#E11D48"
                      />
                    }
                    name={
                      selectedPdf.fileName
                    }
                    details={
                      formatSize(
                        selectedPdf.size,
                      )
                    }
                    onRemove={() => {

                      setSelectedPdf(
                        null,
                      );


                      setTitle(
                        '',
                      );
                    }}
                  />

                ) : (

                  <SelectFileButton
                    title="Choose PDF"
                    loading={
                      pickingPdf
                    }
                    color="#E11D48"
                    onPress={
                      handleSelectPdf
                    }
                  />

                )}


                <FieldLabel>
                  Title
                </FieldLabel>


                <TextInput
                  value={title}
                  onChangeText={
                    setTitle
                  }
                  editable={!busy}
                  placeholder="Material title"
                  placeholderTextColor="#94A3B8"
                  className="
                    mb-2
                    min-h-[52px]
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-slate-900
                  "
                />


                <SaveButton
                  disabled={
                    busy ||
                    !title.trim() ||
                    !selectedPdf
                  }
                  loading={
                    uploading ||
                    creating
                  }
                  title="Save PDF"
                  color="#E11D48"
                  onPress={
                    handleSavePdf
                  }
                />

              </FormCard>

            )}


            {/* =================================================
                IMAGE FORM
            ================================================== */}

            {selectedSource ===
              'image' && (

              <FormCard>

                <FormTitle>
                  Image material
                </FormTitle>


                {selectedImage ? (

                  <>

                    <MediaPreview
                      image={
                        selectedImage
                      }
                      color="#0284C7"
                      background="#E0F2FE"
                      details={
                        formatSize(
                          selectedImage.size,
                        )
                      }
                      onRemove={() => {

                        setSelectedImage(
                          null,
                        );


                        setTitle(
                          '',
                        );
                      }}
                    />


                    <Pressable
                      disabled={busy}
                      onPress={
                        handleSelectImage
                      }
                      className="
                        mb-5
                        self-start
                      ">

                      <Text
                        className="
                          font-semibold
                          text-sky-600
                        ">

                        Choose another image

                      </Text>

                    </Pressable>

                  </>

                ) : (

                  <SelectFileButton
                    title="Choose image"
                    loading={
                      pickingImage
                    }
                    color="#0284C7"
                    onPress={
                      handleSelectImage
                    }
                  />

                )}


                <FieldLabel>
                  Title
                </FieldLabel>


                <TextInput
                  value={title}
                  onChangeText={
                    setTitle
                  }
                  editable={!busy}
                  placeholder="Material title"
                  placeholderTextColor="#94A3B8"
                  className="
                    mb-2
                    min-h-[52px]
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-slate-900
                  "
                />


                <SaveButton
                  disabled={
                    busy ||
                    !title.trim() ||
                    !selectedImage
                  }
                  loading={
                    uploading ||
                    creating
                  }
                  title="Save image"
                  color="#0284C7"
                  onPress={
                    handleSaveImage
                  }
                />

              </FormCard>

            )}


            {/* =================================================
                CAMERA FORM
            ================================================== */}

            {selectedSource ===
              'camera' && (

              <FormCard>

                <View
                  className="
                    mb-6
                    flex-row
                    items-center
                  ">

                  <View
                    className="
                      mr-3
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-green-50
                    ">

                    <Camera
                      size={21}
                      color="#16A34A"
                    />

                  </View>


                  <View className="flex-1">

                    <Text
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                      ">

                      Camera material

                    </Text>


                    <Text
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      ">

                      Capture, preview and upload
                      your study material.

                    </Text>

                  </View>

                </View>


                {!capturedImage ? (

                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={
                      handleCapturePhoto
                    }
                    className="
                      min-h-[150px]
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-dashed
                      border-green-300
                      bg-green-50
                    "
                    style={({
                      pressed,
                    }) => ({
                      opacity:
                        busy
                          ? 0.5
                          : pressed
                            ? 0.8
                            : 1,
                    })}>

                    {capturing ? (

                      <ActivityIndicator
                        color="#16A34A"
                      />

                    ) : (

                      <>

                        <View
                          className="
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-white
                          ">

                          <Camera
                            size={27}
                            color="#16A34A"
                          />

                        </View>


                        <Text
                          className="
                            mt-4
                            text-base
                            font-bold
                            text-green-700
                          ">

                          Open camera

                        </Text>


                        <Text
                          className="
                            mt-1
                            text-xs
                            text-green-700
                          ">

                          Take a photo of your notes

                        </Text>

                      </>

                    )}

                  </Pressable>

                ) : (

                  <>

                    <MediaPreview
                      image={
                        capturedImage
                      }
                      color="#16A34A"
                      background="#F0FDF4"
                      details={
                        formatSize(
                          capturedImage.size,
                        )
                      }
                      onRemove={() => {

                        setCapturedImage(
                          null,
                        );


                        setTitle(
                          '',
                        );
                      }}
                    />


                    <Pressable
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={
                        handleRetakePhoto
                      }
                      className="
                        mb-6
                        min-h-[48px]
                        flex-row
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-green-200
                        bg-green-50
                      "
                      style={({
                        pressed,
                      }) => ({
                        opacity:
                          pressed
                            ? 0.7
                            : 1,
                      })}>

                      <RotateCcw
                        size={18}
                        color="#15803D"
                      />


                      <Text
                        className="
                          ml-2
                          font-bold
                          text-green-700
                        ">

                        Retake photo

                      </Text>

                    </Pressable>

                  </>

                )}


                <FieldLabel>
                  Title
                </FieldLabel>


                <TextInput
                  value={title}
                  onChangeText={
                    setTitle
                  }
                  editable={
                    !busy &&
                    !!capturedImage
                  }
                  placeholder="Camera material title"
                  placeholderTextColor="#94A3B8"
                  className="
                    mb-2
                    min-h-[52px]
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-slate-900
                  "
                />


                <SaveButton
                  disabled={
                    busy ||
                    !title.trim() ||
                    !capturedImage
                  }
                  loading={
                    uploading ||
                    creating
                  }
                  title="Save camera photo"
                  color="#16A34A"
                  onPress={
                    handleSaveCameraPhoto
                  }
                />

              </FormCard>

            )}

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};


// =========================================================
// Source Card
// =========================================================

interface SourceCardProps {
  title:
    string;

  description:
    string;

  selected:
    boolean;

  disabled:
    boolean;

  color:
    string;

  background:
    string;

  icon:
    React.ReactNode;

  loading?:
    boolean;

  onPress:
    () => void;
}


const SourceCard = ({
  title,
  description,
  selected,
  disabled,
  color,
  background,
  icon,
  loading = false,
  onPress,
}: SourceCardProps) => (

  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    className="
      mb-4
      flex-row
      items-center
      rounded-[20px]
      border
      bg-white
      p-4
    "
    style={({
      pressed,
    }) => ({
      borderColor:
        selected
          ? color
          : '#E2E8F0',

      opacity:
        disabled
          ? 0.6
          : pressed
            ? 0.82
            : 1,
    })}>

    <View
      className="
        mr-4
        h-[54px]
        w-[54px]
        items-center
        justify-center
        rounded-[16px]
      "
      style={{
        backgroundColor:
          background,
      }}>

      {loading ? (

        <ActivityIndicator
          color={color}
        />

      ) : (

        icon

      )}

    </View>


    <View className="flex-1">

      <Text
        className="
          text-base
          font-bold
          text-slate-900
        ">

        {title}

      </Text>


      <Text
        className="
          mt-1
          text-xs
          text-slate-500
        ">

        {description}

      </Text>

    </View>


    {selected && (

      <CheckCircle2
        size={21}
        color={color}
      />

    )}

  </Pressable>
);


// =========================================================
// Form Card
// =========================================================

const FormCard = ({
  children,
}: {
  children:
    React.ReactNode;
}) => (

  <View
    className="
      rounded-3xl
      border
      border-slate-200
      bg-white
      p-5
    ">

    {children}

  </View>
);


// =========================================================
// Form Title
// =========================================================

const FormTitle = ({
  children,
}: {
  children:
    React.ReactNode;
}) => (

  <Text
    className="
      mb-6
      text-lg
      font-bold
      text-slate-900
    ">

    {children}

  </Text>
);


// =========================================================
// Field Label
// =========================================================

const FieldLabel = ({
  children,
}: {
  children:
    React.ReactNode;
}) => (

  <Text
    className="
      mb-2
      text-sm
      font-semibold
      text-slate-900
    ">

    {children}

  </Text>
);


// =========================================================
// Select File Button
// =========================================================

const SelectFileButton = ({
  title,
  loading,
  color,
  onPress,
}: {
  title:
    string;

  loading:
    boolean;

  color:
    string;

  onPress:
    () => void;
}) => (

  <Pressable
    accessibilityRole="button"
    disabled={loading}
    onPress={onPress}
    className="
      mb-5
      min-h-[110px]
      items-center
      justify-center
      rounded-2xl
      border
      border-dashed
      border-slate-300
      bg-slate-50
    "
    style={({
      pressed,
    }) => ({
      opacity:
        loading
          ? 0.6
          : pressed
            ? 0.8
            : 1,
    })}>

    {loading ? (

      <ActivityIndicator
        color={color}
      />

    ) : (

      <>

        <UploadCloud
          size={28}
          color={color}
        />


        <Text
          className="
            mt-3
            font-bold
            text-slate-800
          ">

          {title}

        </Text>

      </>

    )}

  </Pressable>
);


// =========================================================
// Selected File
// =========================================================

const SelectedFile = ({
  icon,
  name,
  details,
  onRemove,
}: {
  icon:
    React.ReactNode;

  name:
    string;

  details:
    string;

  onRemove:
    () => void;
}) => (

  <View
    className="
      mb-5
      flex-row
      items-center
      rounded-2xl
      border
      border-slate-200
      bg-slate-50
      p-4
    ">

    <View
      className="
        mr-3
        h-11
        w-11
        items-center
        justify-center
        rounded-xl
        bg-white
      ">

      {icon}

    </View>


    <View className="flex-1">

      <Text
        numberOfLines={1}
        className="
          font-bold
          text-slate-900
        ">

        {name}

      </Text>


      <Text
        className="
          mt-1
          text-xs
          text-slate-500
        ">

        {details}

      </Text>

    </View>


    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Remove file"
      onPress={onRemove}
      className="
        h-9
        w-9
        items-center
        justify-center
        rounded-xl
        bg-white
      ">

      <X
        size={17}
        color="#64748B"
      />

    </Pressable>

  </View>
);


// =========================================================
// Image / Camera Preview
// =========================================================

const MediaPreview = ({
  image,
  color,
  background,
  details,
  onRemove,
}: {
  image:
    PickedImage;

  color:
    string;

  background:
    string;

  details:
    string;

  onRemove:
    () => void;
}) => (

  <View
    className="
      mb-5
      overflow-hidden
      rounded-2xl
      border
      border-slate-200
      bg-white
    ">

    <Image
      source={{
        uri:
          image.localUri,
      }}
      resizeMode="cover"
      className="
        h-[180px]
        w-full
      "
    />


    <View
      className="
        flex-row
        items-center
        p-4
      ">

      <View
        className="
          mr-3
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
        "
        style={{
          backgroundColor:
            background,
        }}>

        <ImageIcon
          size={19}
          color={color}
        />

      </View>


      <View className="flex-1">

        <Text
          numberOfLines={1}
          className="
            font-bold
            text-slate-900
          ">

          {image.fileName}

        </Text>


        <Text
          className="
            mt-1
            text-xs
            text-slate-500
          ">

          {details}

        </Text>

      </View>


      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove photo"
        onPress={onRemove}
        className="
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-slate-50
        ">

        <X
          size={18}
          color="#64748B"
        />

      </Pressable>

    </View>

  </View>
);


// =========================================================
// Save Button
// =========================================================

const SaveButton = ({
  disabled,
  loading,
  title,
  color,
  onPress,
}: {
  disabled:
    boolean;

  loading:
    boolean;

  title:
    string;

  color:
    string;

  onPress:
    () => void;
}) => (

  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    className="
      mt-4
      min-h-[56px]
      flex-row
      items-center
      justify-center
      rounded-xl
      px-6
    "
    style={({
      pressed,
    }) => ({
      backgroundColor:
        color,

      opacity:
        disabled
          ? 0.4
          : pressed
            ? 0.8
            : 1,
    })}>

    {loading ? (

      <>

        <ActivityIndicator
          color="#FFFFFF"
        />


        <Text
          className="
            ml-3
            text-base
            font-bold
            text-white
          ">

          Saving...

        </Text>

      </>

    ) : (

      <>

        <UploadCloud
          size={18}
          color="#FFFFFF"
        />


        <Text
          className="
            ml-2
            text-base
            font-bold
            text-white
          ">

          {title}

        </Text>

      </>

    )}

  </Pressable>
);


export default AddMaterialScreen;