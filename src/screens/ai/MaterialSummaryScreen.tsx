import React, {
  useCallback,
} from 'react';

import {
  SafeAreaView,
  View,
} from 'react-native';

import {
  BrainCircuit,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import AiSummaryErrorState
  from '../../components/ai/AiSummaryErrorState';

import AiSummaryLoadingState
  from '../../components/ai/AiSummaryLoadingState';

import AiSummaryResult
  from '../../components/ai/AiSummaryResult';

import ScreenHeader
  from '../../components/common/ScreenHeader';

import {
  useMaterialSummaryScreen,
} from '../../hooks/useMaterialSummaryScreen';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';


type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'MaterialSummary'
  >;


const MaterialSummaryScreen = ({
  navigation,
  route,
}: Props) => {

  const {
    materialId,
    subjectId,
    subjectName,
    materialTitle,
  } = route.params;


  // =========================================================
  // SCREEN STATE
  // =========================================================

  const screen =
    useMaterialSummaryScreen({
      materialId,
    });


  // =========================================================
  // BACK
  // =========================================================

  const handleBack =
    useCallback(
      () => {

        if (
          navigation.canGoBack()
        ) {

          navigation.goBack();

          return;
        }


        navigation.replace(
          'MaterialDetails',
          {
            materialId,

            subjectId,

            subjectName,
          },
        );

      },
      [
        navigation,
        materialId,
        subjectId,
        subjectName,
      ],
    );


  // =========================================================
  // UI
  // =========================================================

  return (

    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

      <View
        className="
          px-6
          pt-6
        ">

        <ScreenHeader
          title="AI Summary"

          subtitle={
            subjectName
          }

          onBack={
            handleBack
          }

          right={

            <View
              className="
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-indigo-50
              ">

              <BrainCircuit
                size={21}
                color="#4F46E5"
                strokeWidth={2.1}
              />

            </View>

          }
        />

      </View>


      {/* =====================================================
          LOADING
      ====================================================== */}

      {
        screen.generating &&
        !screen.summary
          ? (

            <AiSummaryLoadingState />

          )

          : null
      }


      {/* =====================================================
          ERROR
      ====================================================== */}

      {
        !screen.generating &&
        !screen.summary &&
        screen.error
          ? (

            <AiSummaryErrorState
              error={
                screen.error
              }

              generating={
                screen.generating
              }

              onRetry={
                screen.generateSummary
              }
            />

          )

          : null
      }


      {/* =====================================================
          RESULT
      ====================================================== */}

      {
        screen.summary
          ? (

            <AiSummaryResult
              summary={
                screen.summary
              }

              materialTitle={
                materialTitle
              }

              generating={
                screen.generating
              }

              onGenerateAgain={
                screen.generateSummary
              }
            />

          )

          : null
      }

    </SafeAreaView>
  );
};


export default MaterialSummaryScreen;