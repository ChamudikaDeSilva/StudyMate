import React, {
  useEffect,
  useMemo,
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
  Eye,
  FileImage,
  FileText,
  Pencil,
  Save,
  Trash2,
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


type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'MaterialDetails'
  >;


const MaterialDetailsScreen = ({
  navigation,
  route,
}: Props) => {

  const {
    materialId,
    subjectId,
    subjectName,
  } = route.params;


  const {
    materials,

    loading,

    updatingMaterialId,

    deletingMaterialId,

    error,

    loadMaterials,

    updateMaterial,

    updateImageTitle,

    deleteMaterial,
  } = useMaterials(
    subjectId,
  );


  const material =
    useMemo(
      () =>
        materials.find(
          item =>
            item.id ===
            materialId,
        ),
      [
        materials,
        materialId,
      ],
    );


  const [
    editing,
    setEditing,
  ] = useState(
    false,
  );


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


  const isUpdating =
    updatingMaterialId ===
    materialId;


  const isDeleting =
    deletingMaterialId ===
    materialId;


  const busy =
    isUpdating ||
    isDeleting;


  useEffect(
    () => {

      if (!material) {
        return;
      }


      setTitle(
        material.title,
      );


      setContent(
        material.content ??
        '',
      );

    },
    [
      material,
    ],
  );


  // =========================================================
  // EDIT
  // =========================================================

  const startEditing =
    () => {

      if (
        !material ||
        busy
      ) {
        return;
      }


      if (
        material.sourceType !==
          'text' &&
        material.sourceType !==
          'image'
      ) {
        return;
      }


      setTitle(
        material.title,
      );


      setContent(
        material.content ??
        '',
      );


      setEditing(
        true,
      );
    };


  const cancelEditing =
    () => {

      if (
        !material ||
        busy
      ) {
        return;
      }


      setTitle(
        material.title,
      );


      setContent(
        material.content ??
        '',
      );


      setEditing(
        false,
      );
    };


  const handleSave =
    async () => {

      if (!material) {
        return;
      }


      const cleanTitle =
        title.trim();


      if (!cleanTitle) {

        Alert.alert(
          'Title required',
          'Please enter a material title.',
        );

        return;
      }


      try {

        // ===============================================
        // IMAGE → rename only
        // ===============================================

        if (
          material.sourceType ===
          'image'
        ) {

          await updateImageTitle(
            material.id,
            cleanTitle,
          );


          setEditing(
            false,
          );

          return;
        }


        // ===============================================
        // TEXT
        // ===============================================

        if (
          material.sourceType !==
          'text'
        ) {
          return;
        }


        const cleanContent =
          content.trim();


        if (!cleanContent) {

          Alert.alert(
            'Content required',
            'Please enter study content.',
          );

          return;
        }


        await updateMaterial(
          material.id,
          cleanTitle,
          cleanContent,
        );


        setEditing(
          false,
        );

      } catch (
        saveError
      ) {

        console.error(
          'Update material error:',
          saveError,
        );


        Alert.alert(
          'Unable to update material',

          saveError instanceof Error
            ? saveError.message
            : 'Unable to update material.',
        );
      }
    };


  // =========================================================
  // PDF PREVIEW
  // =========================================================

  const handlePreviewPdf =
    () => {

      if (
        !material ||
        material.sourceType !==
        'pdf'
      ) {
        return;
      }


      navigation.navigate(
        'PdfPreview',
        {
          materialId:
            material.id,

          subjectId,

          subjectName,

          title:
            material.title,
        },
      );
    };


  // =========================================================
  // IMAGE PREVIEW
  // =========================================================

  const handlePreviewImage =
    () => {

      if (
        !material ||
        material.sourceType !==
        'image'
      ) {
        return;
      }


      navigation.navigate(
        'ImagePreview',
        {
          materialId:
            material.id,

          subjectId,

          subjectName,

          title:
            material.title,
        },
      );
    };


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete =
    () => {

      if (
        !material ||
        busy
      ) {
        return;
      }


      Alert.alert(
        'Delete material',

        `Are you sure you want to delete "${material.title}"?`,

        [
          {
            text:
              'Cancel',

            style:
              'cancel',
          },

          {
            text:
              'Delete',

            style:
              'destructive',

            onPress:
              async () => {

                try {

                  await deleteMaterial(
                    material.id,
                  );


                  navigation.goBack();

                } catch (
                  deleteError
                ) {

                  Alert.alert(
                    'Unable to delete material',

                    deleteError instanceof Error
                      ? deleteError.message
                      : 'Unable to delete material.',
                  );
                }
              },
          },
        ],
      );
    };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <SafeAreaView
        className="
          flex-1
          items-center
          justify-center
          bg-slate-50
        ">

        <ActivityIndicator
          color="#4F46E5"
        />


        <Text
          className="
            mt-4
            text-sm
            font-semibold
            text-slate-500
          ">

          Loading material...

        </Text>

      </SafeAreaView>
    );
  }


  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!material) {

    return (
      <SafeAreaView
        className="
          flex-1
          bg-slate-50
        ">

        <View
          className="
            flex-1
            px-6
            pt-6
          ">

          <Pressable
            onPress={() =>
              navigation.goBack()
            }
            className="
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
            ">

            <ArrowLeft
              size={22}
              color="#0F172A"
            />

          </Pressable>


          <View
            className="
              flex-1
              items-center
              justify-center
              pb-20
            ">

            <Text
              className="
                text-xl
                font-bold
                text-slate-900
              ">

              Material not found

            </Text>


            <Text
              className="
                mt-2
                text-center
                text-sm
                text-slate-500
              ">

              {
                error ??
                'The material may have been removed.'
              }

            </Text>


            <Pressable
              onPress={
                loadMaterials
              }
              className="
                mt-6
                rounded-xl
                bg-indigo-50
                px-6
                py-3
              ">

              <Text
                className="
                  font-bold
                  text-indigo-600
                ">

                Try again

              </Text>

            </Pressable>

          </View>

        </View>

      </SafeAreaView>
    );
  }


  const isPdf =
    material.sourceType ===
    'pdf';


  const isImage =
    material.sourceType ===
    'image';


  const typeColor =
    isPdf
      ? '#E11D48'
      : isImage
        ? '#0284C7'
        : '#4F46E5';


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
              120,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }>

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
                ">

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
                    text-slate-900
                  ">

                  Material

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


              {!editing &&
              (
                material.sourceType ===
                  'text' ||
                material.sourceType ===
                  'image'
              ) && (

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit material"
                  disabled={busy}
                  onPress={
                    startEditing
                  }
                  className="
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-indigo-50
                  ">

                  <Pencil
                    size={20}
                    color="#4F46E5"
                  />

                </Pressable>

              )}

            </View>


            {/* =================================================
                TYPE
            ================================================== */}

            <View
              className="
                mb-6
                flex-row
                items-center
                rounded-[20px]
                border
                border-indigo-100
                bg-indigo-50
                p-4
              ">

              <View
                className="
                  mr-4
                  h-[52px]
                  w-[52px]
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white
                ">

                {isImage ? (

                  <FileImage
                    size={23}
                    color={
                      typeColor
                    }
                  />

                ) : (

                  <FileText
                    size={23}
                    color={
                      typeColor
                    }
                  />

                )}

              </View>


              <View
                className="flex-1">

                <Text
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-indigo-500
                  ">

                  Material type

                </Text>


                <Text
                  className="
                    mt-1
                    text-base
                    font-bold
                    capitalize
                    text-slate-900
                  ">

                  {material.sourceType}

                </Text>

              </View>


              <View
                className="
                  rounded-full
                  bg-white
                  px-3
                  py-1.5
                ">

                <Text
                  className="
                    text-xs
                    font-bold
                    text-indigo-500
                  ">

                  {material.syncStatus}

                </Text>

              </View>

            </View>


            {/* =================================================
                EDIT MODE
            ================================================== */}

            {editing ? (

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
                    mb-2
                    text-xs
                    font-bold
                    uppercase
                    text-slate-400
                  ">

                  Title

                </Text>


                <TextInput
                  value={title}
                  onChangeText={
                    setTitle
                  }
                  editable={!busy}
                  placeholder="Material title"
                  placeholderTextColor="#94A3B8"
                  className="
                    min-h-[52px]
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-slate-900
                  "
                />


                {material.sourceType ===
                  'text' && (

                  <>

                    <Text
                      className="
                        mb-2
                        mt-5
                        text-xs
                        font-bold
                        uppercase
                        text-slate-400
                      ">

                      Content

                    </Text>


                    <TextInput
                      value={content}
                      onChangeText={
                        setContent
                      }
                      editable={!busy}
                      multiline
                      textAlignVertical="top"
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

                  </>

                )}


                <View
                  className="
                    mt-6
                    flex-row
                  ">

                  <Pressable
                    disabled={busy}
                    onPress={
                      cancelEditing
                    }
                    className="
                      mr-3
                      min-h-[52px]
                      flex-1
                      flex-row
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                    ">

                    <X
                      size={18}
                      color="#64748B"
                    />

                    <Text
                      className="
                        ml-2
                        font-bold
                        text-slate-600
                      ">

                      Cancel

                    </Text>

                  </Pressable>


                  <Pressable
                    disabled={
                      busy ||
                      !title.trim()
                    }
                    onPress={
                      handleSave
                    }
                    className="
                      min-h-[52px]
                      flex-1
                      flex-row
                      items-center
                      justify-center
                      rounded-xl
                      bg-indigo-600
                    ">

                    {isUpdating ? (

                      <ActivityIndicator
                        color="#FFFFFF"
                      />

                    ) : (

                      <>

                        <Save
                          size={18}
                          color="#FFFFFF"
                        />

                        <Text
                          className="
                            ml-2
                            font-bold
                            text-white
                          ">

                          Save

                        </Text>

                      </>

                    )}

                  </Pressable>

                </View>

              </View>

            ) : (

              <>

                {/* =================================================
                    TITLE
                ================================================== */}

                <View
                  className="
                    mb-4
                    rounded-[20px]
                    border
                    border-slate-200
                    bg-white
                    p-5
                  ">

                  <Text
                    className="
                      text-[11px]
                      font-bold
                      uppercase
                      text-slate-400
                    ">

                    Title

                  </Text>


                  <Text
                    className="
                      mt-2
                      text-base
                      font-bold
                      text-slate-900
                    ">

                    {material.title}

                  </Text>

                </View>


                {/* =================================================
                    TEXT
                ================================================== */}

                {material.sourceType ===
                  'text' && (

                  <View
                    className="
                      mb-4
                      rounded-[20px]
                      border
                      border-slate-200
                      bg-white
                      p-5
                    ">

                    <Text
                      className="
                        text-[11px]
                        font-bold
                        uppercase
                        text-slate-400
                      ">

                      Study content

                    </Text>


                    <Text
                      className="
                        mt-3
                        leading-6
                        text-slate-700
                      ">

                      {material.content}

                    </Text>

                  </View>

                )}


                {/* =================================================
                    PDF
                ================================================== */}

                {isPdf && (

                  <View
                    className="
                      mb-4
                      rounded-[20px]
                      border
                      border-rose-100
                      bg-white
                      p-5
                    ">

                    <Text
                      className="
                        text-xs
                        font-bold
                        uppercase
                        text-slate-400
                      ">

                      PDF document

                    </Text>


                    <Text
                      numberOfLines={2}
                      className="
                        mt-2
                        font-bold
                        text-slate-800
                      ">

                      {
                        material.fileName ??
                        'PDF document'
                      }

                    </Text>


                    <Pressable
                      onPress={
                        handlePreviewPdf
                      }
                      className="
                        mt-5
                        min-h-[52px]
                        flex-row
                        items-center
                        justify-center
                        rounded-xl
                        bg-rose-600
                      ">

                      <Eye
                        size={18}
                        color="#FFFFFF"
                      />


                      <Text
                        className="
                          ml-2
                          font-bold
                          text-white
                        ">

                        Preview PDF

                      </Text>

                    </Pressable>

                  </View>

                )}


                {/* =================================================
                    IMAGE
                ================================================== */}

                {isImage && (

                  <View
                    className="
                      mb-4
                      rounded-[20px]
                      border
                      border-sky-100
                      bg-white
                      p-5
                    ">

                    <View
                      className="
                        flex-row
                        items-center
                      ">

                      <View
                        className="
                          mr-3
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-xl
                          bg-sky-50
                        ">

                        <FileImage
                          size={22}
                          color="#0284C7"
                        />

                      </View>


                      <View
                        className="
                          flex-1
                        ">

                        <Text
                          className="
                            text-xs
                            font-bold
                            uppercase
                            text-slate-400
                          ">

                          Image file

                        </Text>


                        <Text
                          numberOfLines={2}
                          className="
                            mt-1
                            font-bold
                            text-slate-800
                          ">

                          {
                            material.fileName ??
                            'Image material'
                          }

                        </Text>

                      </View>

                    </View>


                    <Pressable
                      onPress={
                        handlePreviewImage
                      }
                      className="
                        mt-5
                        min-h-[52px]
                        flex-row
                        items-center
                        justify-center
                        rounded-xl
                        bg-sky-600
                      ">

                      <Eye
                        size={18}
                        color="#FFFFFF"
                      />


                      <Text
                        className="
                          ml-2
                          font-bold
                          text-white
                        ">

                        Preview image

                      </Text>

                    </Pressable>

                  </View>

                )}


                {/* =================================================
                    DELETE
                ================================================== */}

                <Pressable
                  disabled={busy}
                  onPress={
                    handleDelete
                  }
                  className="
                    mt-1
                    min-h-[52px]
                    flex-row
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                  ">

                  {isDeleting ? (

                    <ActivityIndicator
                      color="#EF4444"
                    />

                  ) : (

                    <>

                      <Trash2
                        size={18}
                        color="#EF4444"
                      />


                      <Text
                        className="
                          ml-2
                          font-bold
                          text-red-500
                        ">

                        Delete material

                      </Text>

                    </>

                  )}

                </Pressable>

              </>

            )}

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};


export default MaterialDetailsScreen;