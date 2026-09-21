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
  FileText,
  Image as ImageIcon,
  Type,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {useMaterials} from '../../hooks/useMaterials';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';

type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'AddMaterial'
  >;

type SelectedSource =
  | 'text'
  | null;

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

  const saveDisabled =
    creating ||
    !title.trim() ||
    !content.trim();

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
          Platform.OS === 'ios'
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
                disabled={creating}
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
                style={({pressed}) => ({
                  opacity:
                    creating
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
                Select how you want to
                add learning content to
                this subject.
              </Text>

            </View>

            {/* ==========================================
                TEXT SOURCE
            =========================================== */}

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setSelectedSource(
                  'text',
                )
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
              style={({pressed}) => ({
                borderColor:
                  selectedSource ===
                  'text'
                    ? '#4F46E5'
                    : '#E2E8F0',

                opacity:
                  pressed
                    ? 0.82
                    : 1,

                transform: [
                  {
                    scale:
                      pressed
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
                <View
                  className="
                    rounded-full
                    bg-indigo-50
                    px-3
                    py-1
                  ">

                  <Text
                    className="
                      text-xs
                      font-bold
                      text-indigo-600
                    ">
                    Selected
                  </Text>

                </View>
              )}

            </Pressable>

            {/* ==========================================
                PDF
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
                opacity: 0.6,
              }}>

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

                <FileText
                  size={24}
                  color="#E11D48"
                />

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
                    text-slate-500
                  ">
                  Upload a PDF document.
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
                opacity: 0.6,
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
                opacity: 0.6,
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

                {/* Title */}

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
                  editable={!creating}
                  maxLength={100}
                />

                {/* Content */}

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
                  editable={!creating}
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

                {/* ======================================
                    SAVE
                ======================================= */}

                <Pressable
                  accessibilityRole="button"
                  disabled={
                    saveDisabled
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
                  style={({pressed}) => ({
                    opacity:
                      saveDisabled
                        ? 0.4
                        : pressed
                          ? 0.8
                          : 1,

                    transform: [
                      {
                        scale:
                          !saveDisabled &&
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

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default AddMaterialScreen;