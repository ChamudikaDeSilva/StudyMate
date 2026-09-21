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
  FileText,
  Pencil,
  Save,
  Trash2,
  X,
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
  ] = useState(false);

  const [
    title,
    setTitle,
  ] = useState('');

  const [
    content,
    setContent,
  ] = useState('');

  const isUpdating =
    updatingMaterialId ===
    materialId;

  const isDeleting =
    deletingMaterialId ===
    materialId;

  const busy =
    isUpdating ||
    isDeleting;

  // =========================================================
  // Populate edit form
  // =========================================================

  useEffect(() => {
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
  }, [material]);

  // =========================================================
  // Start editing
  // =========================================================

  const startEditing = () => {
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

    setEditing(true);
  };

  // =========================================================
  // Cancel editing
  // =========================================================

  const cancelEditing = () => {
    if (
      busy ||
      !material
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

    setEditing(false);
  };

  // =========================================================
  // Save changes
  // =========================================================

  const handleSave =
    async () => {
      if (!material) {
        return;
      }

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

      if (
        material.sourceType ===
          'text' &&
        !trimmedContent
      ) {
        Alert.alert(
          'Content required',
          'Please enter some study content.',
        );

        return;
      }

      try {
        await updateMaterial(
          material.id,
          trimmedTitle,
          material.sourceType ===
            'text'
            ? trimmedContent
            : undefined,
        );

        setEditing(false);
      } catch (saveError) {
        console.error(
          'Update material error:',
          saveError,
        );

        Alert.alert(
          'Unable to update material',
          'Something went wrong while updating the material. Please try again.',
        );
      }
    };

  // =========================================================
  // Delete
  // =========================================================

  const handleDelete = () => {
    if (
      !material ||
      busy
    ) {
      return;
    }

    Alert.alert(
      'Delete Material',
      `Are you sure you want to delete "${material.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',

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
                console.error(
                  'Delete material error:',
                  deleteError,
                );

                Alert.alert(
                  'Unable to delete material',
                  'Something went wrong while deleting the material. Please try again.',
                );
              }
            },
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <SafeAreaView
        className="
          flex-1
          bg-slate-50
        ">

        <View
          className="
            flex-1
            items-center
            justify-center
            px-6
          ">

          <View
            className="
              mb-4
              h-[56px]
              w-[56px]
              items-center
              justify-center
              rounded-[18px]
              bg-indigo-50
            ">

            <ActivityIndicator
              size="small"
              color="#4F46E5"
            />

          </View>

          <Text
            className="
              text-lg
              font-bold
              text-slate-900
            ">
            Loading material
          </Text>

          <Text
            className="
              mt-2
              text-center
              text-sm
              text-slate-500
            ">
            Preparing your study
            material...
          </Text>

        </View>

      </SafeAreaView>
    );
  }

  // =========================================================
  // Not found / failed
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
            accessibilityRole="button"
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

            <View
              className="
                mb-5
                h-16
                w-16
                items-center
                justify-center
                rounded-[20px]
                bg-red-50
              ">

              <FileText
                size={29}
                color="#DC2626"
              />

            </View>

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
                max-w-[290px]
                text-center
                text-sm
                leading-5
                text-slate-500
              ">
              {error
                ? 'We could not load this material.'
                : 'This material may have been removed.'}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={
                loadMaterials
              }
              className="
                mt-6
                rounded-xl
                bg-indigo-50
                px-6
                py-3
                active:opacity-80
              ">

              <Text
                className="
                  text-sm
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }>

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
                  active:opacity-70
                ">

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
                  "
                  numberOfLines={1}>
                  Material
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

              {!editing && (
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
                    active:opacity-70
                  ">

                  <Pencil
                    size={20}
                    color="#4F46E5"
                  />

                </Pressable>
              )}

            </View>

            {/* ==========================================
                TYPE CARD
            =========================================== */}

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

                <FileText
                  size={23}
                  color="#4F46E5"
                />

              </View>

              <View className="flex-1">

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
                  py-1
                ">

                <Text
                  className="
                    text-[11px]
                    font-semibold
                    text-indigo-600
                  ">
                  {material.syncStatus}
                </Text>

              </View>

            </View>

            {/* ==========================================
                VIEW MODE
            =========================================== */}

            {!editing ? (
              <>
                <View
                  className="
                    mb-6
                    rounded-3xl
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
                      tracking-wider
                      text-slate-400
                    ">
                    Title
                  </Text>

                  <Text
                    className="
                      mt-2
                      text-xl
                      font-bold
                      leading-7
                      text-slate-900
                    ">
                    {material.title}
                  </Text>

                </View>

                {material.sourceType ===
                  'text' && (
                  <View
                    className="
                      mb-6
                      rounded-3xl
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
                        tracking-wider
                        text-slate-400
                      ">
                      Study content
                    </Text>

                    <Text
                      selectable
                      className="
                        mt-4
                        text-[15px]
                        leading-6
                        text-slate-700
                      ">
                      {material.content}
                    </Text>

                  </View>
                )}

                {!!material.fileName && (
                  <View
                    className="
                      mb-6
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                    ">

                    <Text
                      className="
                        text-xs
                        font-semibold
                        text-slate-400
                      ">
                      File
                    </Text>

                    <Text
                      className="
                        mt-1
                        text-sm
                        font-semibold
                        text-slate-800
                      ">
                      {material.fileName}
                    </Text>

                  </View>
                )}

                {/* ======================================
                    DELETE
                ======================================= */}

                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={
                    handleDelete
                  }
                  className={`
                    min-h-[52px]
                    flex-row
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-6

                    ${
                      busy
                        ? 'opacity-50'
                        : 'active:opacity-80'
                    }
                  `}>

                  {isDeleting ? (
                    <ActivityIndicator
                      size="small"
                      color="#DC2626"
                    />
                  ) : (
                    <>
                      <Trash2
                        size={18}
                        color="#DC2626"
                      />

                      <Text
                        className="
                          ml-2
                          text-sm
                          font-bold
                          text-red-600
                        ">
                        Delete material
                      </Text>
                    </>
                  )}

                </Pressable>
              </>
            ) : (

              /* ========================================
                  EDIT MODE
              ========================================= */

              <View
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                ">

                <View
                  className="
                    mb-6
                    flex-row
                    items-center
                    justify-between
                  ">

                  <View>

                    <Text
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                      ">
                      Edit material
                    </Text>

                    <Text
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      ">
                      Update your study
                      content.
                    </Text>

                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancel editing"
                    disabled={busy}
                    onPress={
                      cancelEditing
                    }
                    className="
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-slate-100
                    ">

                    <X
                      size={19}
                      color="#64748B"
                    />

                  </Pressable>

                </View>

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
                  placeholder="Material title"
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={
                    setTitle
                  }
                  editable={
                    !busy
                  }
                  maxLength={100}
                />

                {/* Content */}

                {material.sourceType ===
                  'text' && (
                  <>
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
                      placeholder="Write or paste your notes..."
                      placeholderTextColor="#94A3B8"
                      value={
                        content
                      }
                      onChangeText={
                        setContent
                      }
                      editable={
                        !busy
                      }
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
                  </>
                )}

                {/* Actions */}

                <View className="flex-row">

                  <Pressable
                    accessibilityRole="button"
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
                      px-4
                    ">

                    <X
                      size={17}
                      color="#64748B"
                    />

                    <Text
                      className="
                        ml-2
                        text-sm
                        font-semibold
                        text-slate-700
                      ">
                      Cancel
                    </Text>

                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    disabled={
                      busy ||
                      !title.trim() ||
                      (
                        material.sourceType ===
                          'text' &&
                        !content.trim()
                      )
                    }
                    onPress={
                      handleSave
                    }
                    className={`
                      min-h-[52px]
                      flex-1
                      flex-row
                      items-center
                      justify-center
                      rounded-xl
                      bg-indigo-600
                      px-4

                      ${
                        busy ||
                        !title.trim() ||
                        (
                          material.sourceType ===
                            'text' &&
                          !content.trim()
                        )
                          ? 'opacity-40'
                          : 'active:opacity-80'
                      }
                    `}>

                    {isUpdating ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <>
                        <Save
                          size={17}
                          color="#FFFFFF"
                        />

                        <Text
                          className="
                            ml-2
                            text-sm
                            font-bold
                            text-white
                          ">
                          Save changes
                        </Text>
                      </>
                    )}

                  </Pressable>

                </View>

              </View>
            )}

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default MaterialDetailsScreen;