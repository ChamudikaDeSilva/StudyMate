import React, {
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
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
  Type,
  UploadCloud,
  X,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {useAuth} from '../../hooks/useAuth';
import {useMaterials} from '../../hooks/useMaterials';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';

import {
  MaterialStorageService,
} from '../../services/storage/MaterialStorageService';

import {
  PdfPickerService,
} from '../../services/storage/PdfPickerService';

import type {
  PickedPdf,
} from '../../services/storage/PdfPickerService';

type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'AddMaterial'
  >;

type SelectedSource =
  | 'text'
  | 'pdf'
  | null;

const pdfPickerService =
  new PdfPickerService();

const materialStorageService =
  new MaterialStorageService();

const MAX_PDF_SIZE =
  20 * 1024 * 1024;

const AddMaterialScreen = ({
  navigation,
  route,
}: Props) => {
  const {
    subjectId,
    subjectName,
  } = route.params;

  const {user} =
    useAuth();

  const {
    createMaterial,
    creating,
  } = useMaterials(
    subjectId,
  );

  const [
    selectedSource,
    setSelectedSource,
  ] = useState<SelectedSource>(
    null,
  );

  const [
    title,
    setTitle,
  ] = useState('');

  const [
    content,
    setContent,
  ] = useState('');

  const [
    selectedPdf,
    setSelectedPdf,
  ] = useState<
    PickedPdf | null
  >(null);

  const [
    pickingPdf,
    setPickingPdf,
  ] = useState(false);

  const [
    uploadingPdf,
    setUploadingPdf,
  ] = useState(false);

  const busy =
    creating ||
    pickingPdf ||
    uploadingPdf;

  const textSaveDisabled =
    busy ||
    !title.trim() ||
    !content.trim();

  const pdfSaveDisabled =
    busy ||
    !title.trim() ||
    !selectedPdf;

  // =========================================================
  // Helpers
  // =========================================================

  const getPdfTitle = (
    fileName: string,
  ) => {
    return fileName
      .replace(
        /\.pdf$/i,
        '',
      )
      .replace(
        /[_-]+/g,
        ' ',
      )
      .trim();
  };

  const formatFileSize = (
    bytes?: number,
  ) => {
    if (
      bytes === undefined
    ) {
      return 'PDF document';
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

  // =========================================================
  // Select Text
  // =========================================================

  const handleSelectText =
    () => {
      if (busy) {
        return;
      }

      setSelectedSource(
        'text',
      );

      setSelectedPdf(
        null,
      );

      setTitle('');
      setContent('');
    };

  // =========================================================
  // Pick PDF
  // =========================================================

  const handleSelectPdf =
    async () => {
      if (busy) {
        return;
      }

      setSelectedSource(
        'pdf',
      );

      setContent('');

      try {
        setPickingPdf(true);

        const pdf =
          await pdfPickerService
            .pickPdf();

        /*
         * User cancelled picker.
         */
        if (!pdf) {
          return;
        }

        /*
         * App-side size validation.
         */
        if (
          pdf.size !==
            undefined &&
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
          getPdfTitle(
            pdf.fileName,
          ),
        );
      } catch (error) {
        console.error(
          'PDF picker error:',
          error,
        );

        Alert.alert(
          'Unable to select PDF',
          error instanceof Error
            ? error.message
            : 'Something went wrong while selecting the PDF.',
        );
      } finally {
        setPickingPdf(false);
      }
    };

  // =========================================================
  // Remove PDF
  // =========================================================

  const handleRemovePdf =
    () => {
      if (busy) {
        return;
      }

      setSelectedPdf(
        null,
      );

      setTitle('');
    };

  // =========================================================
  // Save Text Material
  // =========================================================

  const handleSaveTextMaterial =
    async () => {
      const trimmedTitle =
        title.trim();

      const trimmedContent =
        content.trim();

      if (!trimmedTitle) {
        Alert.alert(
          'Title required',
          'Please enter a title for your material.',
        );

        return;
      }

      if (!trimmedContent) {
        Alert.alert(
          'Content required',
          'Please enter some study content.',
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
      } catch (error) {
        console.error(
          'Create material error:',
          error,
        );

        Alert.alert(
          'Unable to save material',
          'Something went wrong while saving the material. Please try again.',
        );
      }
    };

  // =========================================================
  // Save PDF Material
  // =========================================================

  const handleSavePdfMaterial =
    async () => {
      if (!user) {
        Alert.alert(
          'Session unavailable',
          'Please sign in again and retry.',
        );

        return;
      }

      if (!selectedPdf) {
        Alert.alert(
          'PDF required',
          'Please select a PDF file.',
        );

        return;
      }

      const trimmedTitle =
        title.trim();

      if (!trimmedTitle) {
        Alert.alert(
          'Title required',
          'Please enter a title for your material.',
        );

        return;
      }

      let uploadedFileUrl:
        | string
        | undefined;

      try {
        setUploadingPdf(
          true,
        );

        // ===============================================
        // 1. Upload physical PDF to Firebase Storage
        // ===============================================

        const uploadResult =
          await materialStorageService
            .uploadPdf({
              userId:
                user.uid,

              subjectId,

              fileName:
                selectedPdf.fileName,

              localUri:
                selectedPdf.localUri,
            });

        uploadedFileUrl =
          uploadResult.fileUrl;

        // ===============================================
        // 2. Create Firestore material record
        // ===============================================

        await createMaterial(
          trimmedTitle,
          'pdf',
          undefined,
          uploadResult.fileName,
          uploadResult.fileUrl,
        );

        // ===============================================
        // 3. Return to materials screen
        // ===============================================

        navigation.goBack();
      } catch (error) {
        const storageError =
          error as {
            code?: string;
            message?: string;
          };

        console.error(
          'PDF MATERIAL ERROR:',
          error,
        );

        console.error(
          'PDF MATERIAL ERROR CODE:',
          storageError.code,
        );

        console.error(
          'PDF MATERIAL ERROR MESSAGE:',
          storageError.message,
        );

        /*
         * If Firebase Storage upload
         * succeeded but Firestore
         * creation failed, remove the
         * uploaded PDF.
         *
         * This prevents orphan files.
         */
        if (
          uploadedFileUrl
        ) {
          try {
            await materialStorageService
              .deleteFile(
                uploadedFileUrl,
              );
          } catch (
            rollbackError
          ) {
            console.error(
              'PDF rollback error:',
              rollbackError,
            );
          }
        }

        /*
         * TEMPORARILY show detailed
         * Firebase error while we are
         * developing.
         *
         * Later we can change this back
         * to a friendly user message.
         */
        Alert.alert(
          'Unable to save PDF',
          `${
            storageError.code ??
            'Unknown error'
          }\n\n${
            storageError.message ??
            'No error message returned.'
          }`,
        );
      } finally {
        setUploadingPdf(
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
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled">

          <View
            className="
              px-6
              pb-12
              pt-6
            ">

            {/* ==========================================
                HEADER
            =========================================== */}

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

              <View className="flex-1">

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
                  "
                  numberOfLines={1}>
                  {subjectName}
                </Text>

              </View>

            </View>

            {/* ==========================================
                INTRO
            =========================================== */}

            <View className="mb-6">

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
                  mt-2
                  text-sm
                  leading-5
                  text-slate-500
                ">
                Add written notes or
                upload an existing PDF
                document.
              </Text>

            </View>

            {/* ==========================================
                TEXT SOURCE
            =========================================== */}

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={
                handleSelectText
              }
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
                  selectedSource ===
                  'text'
                    ? '#4F46E5'
                    : '#E2E8F0',

                opacity:
                  busy
                    ? 0.6
                    : pressed
                      ? 0.82
                      : 1,

                transform: [
                  {
                    scale:
                      pressed &&
                      !busy
                        ? 0.99
                        : 1,
                  },
                ],
              })}>

              <View
                className="
                  mr-4
                  h-[54px]
                  w-[54px]
                  items-center
                  justify-center
                  rounded-[16px]
                  bg-indigo-50
                ">

                <Type
                  size={24}
                  color="#4F46E5"
                />

              </View>

              <View className="flex-1">

                <Text
                  className="
                    text-base
                    font-bold
                    text-slate-900
                  ">
                  Text
                </Text>

                <Text
                  className="
                    mt-1
                    text-xs
                    leading-[18px]
                    text-slate-500
                  ">
                  Write or paste your
                  study notes directly.
                </Text>

              </View>

              {selectedSource ===
                'text' && (
                <CheckCircle2
                  size={21}
                  color="#4F46E5"
                />
              )}

            </Pressable>

            {/* ==========================================
                PDF SOURCE
            =========================================== */}

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={
                handleSelectPdf
              }
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
                  selectedSource ===
                  'pdf'
                    ? '#E11D48'
                    : '#E2E8F0',

                opacity:
                  busy
                    ? 0.6
                    : pressed
                      ? 0.82
                      : 1,

                transform: [
                  {
                    scale:
                      pressed &&
                      !busy
                        ? 0.99
                        : 1,
                  },
                ],
              })}>

              <View
                className="
                  mr-4
                  h-[54px]
                  w-[54px]
                  items-center
                  justify-center
                  rounded-[16px]
                  bg-rose-50
                ">

                {pickingPdf ? (
                  <ActivityIndicator
                    size="small"
                    color="#E11D48"
                  />
                ) : (
                  <FileText
                    size={24}
                    color="#E11D48"
                  />
                )}

              </View>

              <View className="flex-1">

                <Text
                  className="
                    text-base
                    font-bold
                    text-slate-900
                  ">
                  PDF
                </Text>

                <Text
                  className="
                    mt-1
                    text-xs
                    leading-[18px]
                    text-slate-500
                  ">
                  Upload a PDF from
                  your device.
                </Text>

              </View>

              {selectedSource ===
                'pdf' &&
                selectedPdf && (
                  <CheckCircle2
                    size={21}
                    color="#E11D48"
                  />
                )}

            </Pressable>

            {/* ==========================================
                IMAGE
            =========================================== */}

            <View
              className="
                mb-4
                flex-row
                items-center
                rounded-[20px]
                border
                border-slate-200
                bg-white
                p-4
              "
              style={{
                opacity: 0.55,
              }}>

              <View
                className="
                  mr-4
                  h-[54px]
                  w-[54px]
                  items-center
                  justify-center
                  rounded-[16px]
                  bg-sky-50
                ">

                <ImageIcon
                  size={24}
                  color="#0284C7"
                />

              </View>

              <View className="flex-1">

                <Text
                  className="
                    text-base
                    font-bold
                    text-slate-900
                  ">
                  Image
                </Text>

                <Text
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  ">
                  Choose an image from
                  your device.
                </Text>

              </View>

              <View
                className="
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1
                ">

                <Text
                  className="
                    text-[11px]
                    font-semibold
                    text-slate-500
                  ">
                  Coming soon
                </Text>

              </View>

            </View>

            {/* ==========================================
                CAMERA
            =========================================== */}

            <View
              className="
                mb-8
                flex-row
                items-center
                rounded-[20px]
                border
                border-slate-200
                bg-white
                p-4
              "
              style={{
                opacity: 0.55,
              }}>

              <View
                className="
                  mr-4
                  h-[54px]
                  w-[54px]
                  items-center
                  justify-center
                  rounded-[16px]
                  bg-green-50
                ">

                <Camera
                  size={24}
                  color="#16A34A"
                />

              </View>

              <View className="flex-1">

                <Text
                  className="
                    text-base
                    font-bold
                    text-slate-900
                  ">
                  Camera
                </Text>

                <Text
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  ">
                  Capture study
                  material with your
                  camera.
                </Text>

              </View>

              <View
                className="
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1
                ">

                <Text
                  className="
                    text-[11px]
                    font-semibold
                    text-slate-500
                  ">
                  Coming soon
                </Text>

              </View>

            </View>

            {/* ==========================================
                TEXT MATERIAL FORM
            =========================================== */}

            {selectedSource ===
              'text' && (
              <View
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                ">

                <Text
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                  ">
                  Text material
                </Text>

                <Text
                  className="
                    mb-6
                    mt-1
                    text-sm
                    leading-5
                    text-slate-500
                  ">
                  Add a title and your
                  study content.
                </Text>

                <Text
                  className="
                    mb-2
                    text-sm
                    font-semibold
                    text-slate-900
                  ">
                  Title
                </Text>

                <TextInput
                  className="
                    mb-5
                    min-h-[52px]
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-sm
                    text-slate-900
                  "
                  placeholder="e.g. Process Scheduling"
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={
                    setTitle
                  }
                  editable={!busy}
                  maxLength={100}
                />

                <Text
                  className="
                    mb-2
                    text-sm
                    font-semibold
                    text-slate-900
                  ">
                  Study content
                </Text>

                <TextInput
                  className="
                    min-h-[220px]
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-4
                    text-sm
                    leading-5
                    text-slate-900
                  "
                  placeholder="Write or paste your notes here..."
                  placeholderTextColor="#94A3B8"
                  value={content}
                  onChangeText={
                    setContent
                  }
                  editable={!busy}
                  multiline
                  textAlignVertical="top"
                />

                <Text
                  className="
                    mb-6
                    mt-2
                    self-end
                    text-xs
                    text-slate-400
                  ">
                  {content.length}
                  {' '}characters
                </Text>

                <Pressable
                  accessibilityRole="button"
                  disabled={
                    textSaveDisabled
                  }
                  onPress={
                    handleSaveTextMaterial
                  }
                  className="
                    min-h-[52px]
                    flex-row
                    items-center
                    justify-center
                    rounded-xl
                    bg-indigo-600
                    px-6
                  "
                  style={({
                    pressed,
                  }) => ({
                    opacity:
                      textSaveDisabled
                        ? 0.4
                        : pressed
                          ? 0.8
                          : 1,

                    transform: [
                      {
                        scale:
                          !textSaveDisabled &&
                          pressed
                            ? 0.99
                            : 1,
                      },
                    ],
                  })}>

                  {creating ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      className="
                        text-base
                        font-bold
                        text-white
                      ">
                      Save material
                    </Text>
                  )}

                </Pressable>

              </View>
            )}

            {/* ==========================================
                PDF MATERIAL FORM
            =========================================== */}

            {selectedSource ===
              'pdf' && (
              <View
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                ">

                <Text
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                  ">
                  PDF material
                </Text>

                <Text
                  className="
                    mb-6
                    mt-1
                    text-sm
                    leading-5
                    text-slate-500
                  ">
                  Upload a PDF and give
                  it a clear study
                  title.
                </Text>

                {/* ======================================
                    SELECTED PDF
                ======================================= */}

                {selectedPdf ? (
                  <View
                    className="
                      mb-5
                      flex-row
                      items-center
                      rounded-2xl
                      border
                      border-rose-100
                      bg-rose-50
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

                      <FileText
                        size={21}
                        color="#E11D48"
                      />

                    </View>

                    <View className="flex-1">

                      <Text
                        className="
                          text-sm
                          font-bold
                          text-slate-900
                        "
                        numberOfLines={1}>
                        {
                          selectedPdf.fileName
                        }
                      </Text>

                      <Text
                        className="
                          mt-1
                          text-xs
                          text-slate-500
                        ">
                        {formatFileSize(
                          selectedPdf.size,
                        )}
                      </Text>

                    </View>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remove PDF"
                      disabled={busy}
                      onPress={
                        handleRemovePdf
                      }
                      className="
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                      "
                      style={({
                        pressed,
                      }) => ({
                        opacity:
                          busy
                            ? 0.4
                            : pressed
                              ? 0.6
                              : 1,
                      })}>

                      <X
                        size={17}
                        color="#64748B"
                      />

                    </Pressable>

                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={
                      handleSelectPdf
                    }
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
                      px-5
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

                    {pickingPdf ? (
                      <ActivityIndicator
                        size="small"
                        color="#E11D48"
                      />
                    ) : (
                      <>
                        <UploadCloud
                          size={27}
                          color="#E11D48"
                        />

                        <Text
                          className="
                            mt-3
                            text-sm
                            font-bold
                            text-slate-800
                          ">
                          Choose PDF
                        </Text>

                        <Text
                          className="
                            mt-1
                            text-xs
                            text-slate-500
                          ">
                          Maximum 20 MB
                        </Text>
                      </>
                    )}

                  </Pressable>
                )}

                {selectedPdf && (
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={
                      handleSelectPdf
                    }
                    className="
                      mb-5
                      self-start
                      py-1
                    "
                    style={({
                      pressed,
                    }) => ({
                      opacity:
                        busy
                          ? 0.5
                          : pressed
                            ? 0.65
                            : 1,
                    })}>

                    <Text
                      className="
                        text-sm
                        font-semibold
                        text-rose-600
                      ">
                      Choose another PDF
                    </Text>

                  </Pressable>
                )}

                {/* ======================================
                    PDF TITLE
                ======================================= */}

                <Text
                  className="
                    mb-2
                    text-sm
                    font-semibold
                    text-slate-900
                  ">
                  Title
                </Text>

                <TextInput
                  className="
                    mb-6
                    min-h-[52px]
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-sm
                    text-slate-900
                  "
                  placeholder="Material title"
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={
                    setTitle
                  }
                  editable={!busy}
                  maxLength={100}
                />

                {/* ======================================
                    SAVE PDF
                ======================================= */}

                <Pressable
                  accessibilityRole="button"
                  disabled={
                    pdfSaveDisabled
                  }
                  onPress={
                    handleSavePdfMaterial
                  }
                  className="
                    min-h-[52px]
                    flex-row
                    items-center
                    justify-center
                    rounded-xl
                    bg-rose-600
                    px-6
                  "
                  style={({
                    pressed,
                  }) => ({
                    opacity:
                      pdfSaveDisabled
                        ? 0.4
                        : pressed
                          ? 0.8
                          : 1,

                    transform: [
                      {
                        scale:
                          !pdfSaveDisabled &&
                          pressed
                            ? 0.99
                            : 1,
                      },
                    ],
                  })}>

                  {uploadingPdf ||
                  creating ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />

                      <Text
                        className="
                          ml-3
                          text-base
                          font-bold
                          text-white
                        ">
                        {uploadingPdf
                          ? 'Uploading...'
                          : 'Saving...'}
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
                        Save PDF
                      </Text>
                    </>
                  )}

                </Pressable>

              </View>
            )}

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default AddMaterialScreen;