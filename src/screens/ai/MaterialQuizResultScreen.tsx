import React, {
  useCallback,
} from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  RefreshCw,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import ScreenHeader
  from '../../components/common/ScreenHeader';

import QuizReviewCard
  from '../../components/quiz/QuizReviewCard';

import QuizScoreCard
  from '../../components/quiz/QuizScoreCard';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';


type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'MaterialQuizResult'
  >;


const MaterialQuizResultScreen = ({
  navigation,
  route,
}: Props) => {

  const {

    materialId,

    subjectId,

    subjectName,

    materialTitle,

    result,

  } = route.params;


  const handleNewQuiz =
    useCallback(
      () => {

        navigation.replace(
          'MaterialQuiz',
          {
            materialId,

            subjectId,

            subjectName,

            materialTitle,

            forceGenerate:
              true,
          },
        );

      },
      [
        navigation,
        materialId,
        subjectId,
        subjectName,
        materialTitle,
      ],
    );


  const handleMaterial =
    useCallback(
      () => {

        navigation.navigate(
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
          title="Quiz Result"

          subtitle={
            subjectName
          }

          onBack={
            handleMaterial
          }
        />

      </View>


      <ScrollView
        className="
          flex-1
        "
        showsVerticalScrollIndicator={
          false
        }>

        <View
          className="
            px-6
            pb-10
            pt-4
          ">

          <QuizScoreCard
            score={
              result.score
            }

            total={
              result.totalQuestions
            }

            percentage={
              result.percentage
            }
          />


          <Text
            className="
              mb-4
              mt-7
              text-lg
              font-bold
              text-slate-900
            ">

            Answer review

          </Text>


          {
            result.answers.map(
              answer => (

                <QuizReviewCard
                  key={
                    answer.questionId
                  }

                  answer={
                    answer
                  }
                />

              ),
            )
          }


          <Pressable
            onPress={
              handleNewQuiz
            }

            className="
              mt-2
              flex-row
              items-center
              justify-center
              rounded-2xl
              bg-indigo-600
              px-5
              py-4
            ">

            <RefreshCw
              size={18}
              color="#FFFFFF"
            />


            <Text
              className="
                ml-2
                text-sm
                font-bold
                text-white
              ">

              Try New Quiz

            </Text>

          </Pressable>


          <Pressable
            onPress={
              handleMaterial
            }

            className="
              mt-3
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-5
              py-4
            ">

            <Text
              className="
                text-sm
                font-bold
                text-slate-700
              ">

              Back to Material

            </Text>

          </Pressable>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};


export default MaterialQuizResultScreen;