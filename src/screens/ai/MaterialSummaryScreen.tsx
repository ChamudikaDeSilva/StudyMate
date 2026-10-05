import React, {
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  BrainCircuit,
  RefreshCw,
  Sparkles,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import AiKeyPointsCard
  from '../../components/ai/AiKeyPointsCard';

import AiStudyTipsCard
  from '../../components/ai/AiStudyTipsCard';

import AiSummaryCard
  from '../../components/ai/AiSummaryCard';

import ActionButton
  from '../../components/common/ActionButton';

import BackButton
  from '../../components/common/BackButton';

import {
  useMaterialSummary,
} from '../../hooks/useMaterialSummary';

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


  const {
    summary,
    generating,
    error,
    generate,
  } = useMaterialSummary();


  // =========================================================
  // INITIAL REQUEST GUARD
  // =========================================================

  const initialRequestStarted =
    useRef(
      false,
    );


  // =========================================================
  // GENERATE
  // =========================================================

  const handleGenerate =
    useCallback(
      async () => {

        try {

          await generate(
            materialId,
          );

        } catch {

          /*
           * Error state is already
           * handled by useMaterialSummary.
           */
        }

      },
      [
        generate,
        materialId,
      ],
    );


  // =========================================================
  // INITIAL GENERATION
  // =========================================================

  useEffect(
    () => {

      if (
        initialRequestStarted.current
      ) {

        return;
      }


      initialRequestStarted.current =
        true;


      void handleGenerate();

    },
    [
      handleGenerate,
    ],
  );


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


        /*
         * Fallback only.
         *
         * Normally MaterialSummary
         * is opened from MaterialDetails,
         * therefore goBack() should
         * always be available.
         */
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
  // DISPLAY VALUES
  // =========================================================

  const displayTitle =
    summary?.title ??
    materialTitle;


  const providerLabel =
    summary?.provider
      ? (
          summary.provider
            .charAt(0)
            .toUpperCase()

          +

          summary.provider
            .slice(1)
        )

      : 'AI';


  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <View
        className="
          border-b
          border-slate-200
          bg-white
          px-5
          pb-4
          pt-3
        ">

        <View
          className="
            flex-row
            items-center
          ">

          <View
            className="
              mr-3
            ">

            <BackButton
              onPress={
                handleBack
              }
            />

          </View>


          <View
            className="
              flex-1
            ">

            <Text
              className="
                text-lg
                font-bold
                text-slate-900
              "
              numberOfLines={1}>

              AI Summary

            </Text>


            <Text
              className="
                mt-0.5
                text-xs
                text-slate-500
              "
              numberOfLines={1}>

              {subjectName}

            </Text>

          </View>


          <View
            className="
              h-10
              w-10
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

        </View>

      </View>


      {/* =====================================================
          LOADING
      ====================================================== */}

      {generating &&
       !summary ? (

        <View
          className="
            flex-1
            items-center
            justify-center
            px-8
          ">

          <View
            className="
              mb-5
              h-16
              w-16
              items-center
              justify-center
              rounded-[22px]
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

            Creating your summary

          </Text>


          <Text
            className="
              mt-2
              text-center
              text-sm
              leading-5
              text-slate-500
            ">

            LearnLoop AI is reading
            your material and identifying
            the most important concepts.

          </Text>


          <View
            className="
              mt-6
              flex-row
              items-center
              rounded-full
              bg-indigo-50
              px-4
              py-2
            ">

            <Sparkles
              size={15}
              color="#4F46E5"
            />

            <Text
              className="
                ml-2
                text-xs
                font-semibold
                text-indigo-600
              ">

              AI processing

            </Text>

          </View>

        </View>

      ) : error &&
          !summary ? (

        /* ===================================================
           ERROR
        ==================================================== */

        <View
          className="
            flex-1
            items-center
            justify-center
            px-6
          ">

          <View
            className="
              w-full
              rounded-[20px]
              border
              border-red-200
              bg-red-50
              p-5
            ">

            <View
              className="
                mb-4
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-red-100
              ">

              <RefreshCw
                size={22}
                color="#DC2626"
              />

            </View>


            <Text
              className="
                text-lg
                font-bold
                text-slate-900
              ">

              Summary unavailable

            </Text>


            <Text
              className="
                mt-2
                text-sm
                leading-5
                text-slate-600
              ">

              {error}

            </Text>


            <View
              className="
                mt-5
              ">

              <ActionButton
                title="Try Again"

                onPress={
                  handleGenerate
                }

                loading={
                  generating
                }

                disabled={
                  generating
                }

                tone="primary"

                variant="solid"

                icon={
                  <RefreshCw
                    size={18}
                    color="#FFFFFF"
                  />
                }
              />

            </View>

          </View>

        </View>

      ) : summary ? (

        /* ===================================================
           RESULT
        ==================================================== */

        <ScrollView
          className="
            flex-1
          "

          contentContainerStyle={{
            paddingHorizontal:
              20,

            paddingTop:
              20,

            paddingBottom:
              36,
          }}

          showsVerticalScrollIndicator={
            false
          }>

          {/* =================================================
              MATERIAL INFORMATION
          ================================================== */}

          <View
            className="
              mb-4
              overflow-hidden
              rounded-[20px]
              bg-indigo-600
              p-5
            ">

            <View
              className="
                flex-row
                items-center
              ">

              <View
                className="
                  mr-4
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/15
                ">

                <Sparkles
                  size={23}
                  color="#FFFFFF"
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
                    tracking-wider
                    text-indigo-100
                  ">

                  AI STUDY SUMMARY

                </Text>


                <Text
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-white
                  "
                  numberOfLines={2}>

                  {displayTitle}

                </Text>

              </View>

            </View>


            <View
              className="
                mt-5
                flex-row
              ">

              <View
                className="
                  mr-3
                  rounded-xl
                  bg-white/10
                  px-3
                  py-2
                ">

                <Text
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    text-indigo-100
                  ">

                  Provider

                </Text>


                <Text
                  className="
                    mt-0.5
                    text-xs
                    font-bold
                    text-white
                  ">

                  {providerLabel}

                </Text>

              </View>


              <View
                className="
                  rounded-xl
                  bg-white/10
                  px-3
                  py-2
                ">

                <Text
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    text-indigo-100
                  ">

                  Source text

                </Text>


                <Text
                  className="
                    mt-0.5
                    text-xs
                    font-bold
                    text-white
                  ">

                  {
                    summary
                      .extractedCharacterCount
                      .toLocaleString()
                  } chars

                </Text>

              </View>

            </View>

          </View>


          {/* =================================================
              SUMMARY
          ================================================== */}

          <View
            className="
              mb-4
            ">

            <AiSummaryCard
              summary={
                summary.summary
              }
            />

          </View>


          {/* =================================================
              KEY POINTS
          ================================================== */}

          <View
            className="
              mb-4
            ">

            <AiKeyPointsCard
              points={
                summary.keyPoints
              }
            />

          </View>


          {/* =================================================
              STUDY TIPS
          ================================================== */}

          <View
            className="
              mb-5
            ">

            <AiStudyTipsCard
              tips={
                summary.studyTips
              }
            />

          </View>


          {/* =================================================
              GENERATE AGAIN
          ================================================== */}

          <ActionButton
            title="Generate Again"

            onPress={
              handleGenerate
            }

            loading={
              generating
            }

            disabled={
              generating
            }

            tone="primary"

            variant="soft"

            icon={
              <RefreshCw
                size={18}
                color="#4F46E5"
              />
            }
          />


          {/* =================================================
              DISCLAIMER
          ================================================== */}

          <Text
            className="
              mt-4
              text-center
              text-xs
              leading-[18px]
              text-slate-400
            ">

            AI-generated study content may
            contain mistakes. Review important
            points against the original material.

          </Text>

        </ScrollView>

      ) : null}

    </SafeAreaView>
  );
};


export default MaterialSummaryScreen;