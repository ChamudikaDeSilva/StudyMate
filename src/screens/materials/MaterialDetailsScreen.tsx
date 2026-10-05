import React, {
  useCallback,
} from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';

import {
  Pencil,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import ScreenHeader
  from '../../components/common/ScreenHeader';

import ScreenState
  from '../../components/common/ScreenState';

import MaterialDetailsContent
  from '../../components/materials/MaterialDetailsContent';

import {
  useMaterialDetailsScreen,
} from '../../hooks/useMaterialDetailsScreen';

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


  // =========================================================
  // DELETE CALLBACK
  // =========================================================

  const handleDeleted =
    useCallback(
      () => {

        navigation.goBack();

      },
      [
        navigation,
      ],
    );


  // =========================================================
  // SCREEN STATE
  // =========================================================

  const screen =
    useMaterialDetailsScreen({
      materialId,
      subjectId,

      onDeleted:
        handleDeleted,
    });


  // =========================================================
  // LOADING
  // =========================================================

  if (
    screen.loading
  ) {

    return (

      <SafeAreaView
        className="
          flex-1
          bg-slate-50
        ">

        <ScreenState
          loading

          title="Loading material"

          description="Preparing material details..."
        />

      </SafeAreaView>
    );
  }


  // =========================================================
  // NOT FOUND
  // =========================================================

  if (
    !screen.material
  ) {

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

          <ScreenHeader
            title="Material"

            subtitle={
              subjectName
            }

            onBack={() =>
              navigation.goBack()
            }
          />


          <ScreenState
            title="Material not found"

            description={
              screen.error ??
              'The material may have been removed.'
            }

            actionTitle="Try again"

            onAction={
              screen.loadMaterials
            }
          />

        </View>

      </SafeAreaView>
    );
  }


  const material =
    screen.material;


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
        className="
          flex-1
        "

        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }>

        <ScrollView
          className="
            flex-1
          "

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

            <ScreenHeader
              title="Material"

              subtitle={
                subjectName
              }

              onBack={() =>
                navigation.goBack()
              }

              right={
                !screen.editing &&
                screen.canEdit
                  ? (

                    <Pressable
                      accessibilityRole="button"

                      accessibilityLabel="Edit material"

                      disabled={
                        screen.busy
                      }

                      onPress={
                        screen.startEditing
                      }

                      className="
                        ml-3
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

                  )

                  : undefined
              }
            />


            {/* =================================================
                MATERIAL CONTENT
            ================================================== */}

            <MaterialDetailsContent
              material={
                material
              }

              editing={
                screen.editing
              }

              title={
                screen.title
              }

              content={
                screen.content
              }

              busy={
                screen.busy
              }

              isUpdating={
                screen.isUpdating
              }

              isDeleting={
                screen.isDeleting
              }

              onTitleChange={
                screen.setTitle
              }

              onContentChange={
                screen.setContent
              }

              onCancelEdit={
                screen.cancelEditing
              }

              onSave={
                screen.saveMaterial
              }

              onDelete={
                screen.deleteCurrentMaterial
              }

              onPreviewPdf={() => {

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
              }}

              onPreviewImage={() => {

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
              }}
            />

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};


export default MaterialDetailsScreen;