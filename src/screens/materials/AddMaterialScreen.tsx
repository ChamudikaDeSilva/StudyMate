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
    uploading,
    setUploading,
  ] = useState(
    false,
  );


  const busy =
    creating ||
    pickingPdf ||
    pickingImage ||
    uploading;


  // =========================================================
  // HELPERS
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


  const resetSelections =
    () => {

      setSelectedPdf(
        null,
      );


      setSelectedImage(
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
  // SELECT TEXT
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
  // SELECT PDF
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
  // SELECT IMAGE
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
  // SAVE TEXT
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
  // SAVE PDF
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
  // SAVE IMAGE
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

              Add notes, PDF documents
              or images.

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
              description="Choose an image from your device."
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
                opacity:
                  0.5,
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


              <View
                className="
                  flex-1
                ">

                <Text
                  className="
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

                  Capture study material
                  with your camera.

                </Text>

              </View>


              <Text
                className="
                  text-xs
                  font-semibold
                  text-slate-400
                ">

                Next

              </Text>

            </View>


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

                    <View
                      className="
                        mb-5
                        overflow-hidden
                        rounded-2xl
                        border
                        border-sky-100
                        bg-sky-50
                      ">

                      <Image
                        source={{
                          uri:
                            selectedImage.localUri,
                        }}
                        resizeMode="cover"
                        className="
                          h-[150px]
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
                            flex-1
                          ">

                          <Text
                            numberOfLines={1}
                            className="
                              font-bold
                              text-slate-900
                            ">

                            {
                              selectedImage.fileName
                            }

                          </Text>


                          <Text
                            className="
                              mt-1
                              text-xs
                              text-slate-500
                            ">

                            {
                              formatSize(
                                selectedImage.size,
                              )
                            }

                          </Text>

                        </View>


                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Remove image"
                          disabled={busy}
                          onPress={() => {

                            setSelectedImage(
                              null,
                            );


                            setTitle(
                              '',
                            );
                          }}
                          className="
                            h-10
                            w-10
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
                                ? 0.5
                                : pressed
                                  ? 0.65
                                  : 1,
                          })}>

                          <X
                            size={18}
                            color="#64748B"
                          />

                        </Pressable>

                      </View>

                    </View>


                    <Pressable
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={
                        handleSelectImage
                      }
                      className="
                        mb-5
                        self-start
                      "
                      style={({
                        pressed,
                      }) => ({
                        opacity:
                          pressed
                            ? 0.65
                            : 1,
                      })}>

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
                  returnKeyType="done"
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

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};


// =========================================================
// SOURCE CARD
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


    <View
      className="
        flex-1
      ">

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
// FORM CARD
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
// FORM TITLE
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
// FIELD LABEL
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
// SELECT FILE BUTTON
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
// SELECTED FILE
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


    <View
      className="
        flex-1
      ">

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
      "
      style={({
        pressed,
      }) => ({
        opacity:
          pressed
            ? 0.65
            : 1,
      })}>

      <X
        size={17}
        color="#64748B"
      />

    </Pressable>

  </View>
);


// =========================================================
// SAVE BUTTON
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

      transform: [
        {
          scale:
            !disabled &&
            pressed
              ? 0.99
              : 1,
        },
      ],
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