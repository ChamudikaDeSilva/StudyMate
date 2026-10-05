import React, {
  useCallback,
} from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import ScreenHeader
  from '../../components/common/ScreenHeader';

import MaterialSourceSelector
  from '../../components/materials/MaterialSourceSelector';

import CameraMaterialForm
  from '../../components/materials/add/CameraMaterialForm';

import ImageMaterialForm
  from '../../components/materials/add/ImageMaterialForm';

import PdfMaterialForm
  from '../../components/materials/add/PdfMaterialForm';

import TextMaterialForm
  from '../../components/materials/add/TextMaterialForm';

import {
  useAddMaterialScreen,
} from '../../hooks/useAddMaterialScreen';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';


type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'AddMaterial'
  >;


const AddMaterialScreen = ({
  navigation,
  route,
}: Props) => {

  const {
    subjectId,
    subjectName,
  } = route.params;


  // =========================================================
  // SUCCESS
  // =========================================================

  const handleSaved =
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
    useAddMaterialScreen({
      subjectId,

      onSaved:
        handleSaved,
    });


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
              40,
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

            <ScreenHeader
              title="Add material"

              subtitle={
                subjectName
              }

              onBack={() =>
                navigation.goBack()
              }
            />


            {/* =================================================
                SOURCE SELECTION
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

              Add notes, PDFs, images or capture study material.

            </Text>


            <MaterialSourceSelector
              selectedSource={
                screen.selectedSource
              }

              busy={
                screen.busy
              }

              pickingPdf={
                screen.pickingPdf
              }

              pickingImage={
                screen.pickingImage
              }

              capturing={
                screen.capturing
              }

              onSelectText={
                screen.selectText
              }

              onSelectPdf={
                screen.selectPdf
              }

              onSelectImage={
                screen.selectImage
              }

              onCapture={
                screen.capturePhoto
              }
            />


            {/* =================================================
                MATERIAL FORM
            ================================================== */}

            <View
              className="
                mt-4
              ">

              {screen.selectedSource ===
                'text' && (

                <TextMaterialForm
                  title={
                    screen.title
                  }

                  content={
                    screen.content
                  }

                  busy={
                    screen.busy
                  }

                  saving={
                    screen.creating
                  }

                  onTitleChange={
                    screen.setTitle
                  }

                  onContentChange={
                    screen.setContent
                  }

                  onSave={
                    screen.saveText
                  }
                />

              )}


              {screen.selectedSource ===
                'pdf' && (

                <PdfMaterialForm
                  title={
                    screen.title
                  }

                  selectedPdf={
                    screen.selectedPdf
                  }

                  busy={
                    screen.busy
                  }

                  picking={
                    screen.pickingPdf
                  }

                  saving={
                    screen.saving
                  }

                  onTitleChange={
                    screen.setTitle
                  }

                  onChoose={
                    screen.selectPdf
                  }

                  onRemove={
                    screen.removePdf
                  }

                  onSave={
                    screen.savePdf
                  }
                />

              )}


              {screen.selectedSource ===
                'image' && (

                <ImageMaterialForm
                  title={
                    screen.title
                  }

                  selectedImage={
                    screen.selectedImage
                  }

                  busy={
                    screen.busy
                  }

                  picking={
                    screen.pickingImage
                  }

                  saving={
                    screen.saving
                  }

                  onTitleChange={
                    screen.setTitle
                  }

                  onChoose={
                    screen.selectImage
                  }

                  onRemove={
                    screen.removeImage
                  }

                  onSave={
                    screen.saveImage
                  }
                />

              )}


              {screen.selectedSource ===
                'camera' && (

                <CameraMaterialForm
                  title={
                    screen.title
                  }

                  capturedImage={
                    screen.capturedImage
                  }

                  busy={
                    screen.busy
                  }

                  capturing={
                    screen.capturing
                  }

                  saving={
                    screen.saving
                  }

                  onTitleChange={
                    screen.setTitle
                  }

                  onCapture={
                    screen.capturePhoto
                  }

                  onRetake={
                    screen.retakePhoto
                  }

                  onRemove={
                    screen.removeCapturedImage
                  }

                  onSave={
                    screen.saveCameraPhoto
                  }
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