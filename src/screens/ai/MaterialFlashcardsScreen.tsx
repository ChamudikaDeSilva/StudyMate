import React, {
  useCallback,
} from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';

import {
  BrainCircuit,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import FlashcardErrorState
  from '../../components/flashcards/FlashcardErrorState';

import FlashcardLoadingState
  from '../../components/flashcards/FlashcardLoadingState';

import FlashcardNavigation
  from '../../components/flashcards/FlashcardNavigation';

import FlashcardProgress
  from '../../components/flashcards/FlashcardProgress';

import FlashcardStudyCard
  from '../../components/flashcards/FlashcardStudyCard';

import ScreenHeader
  from '../../components/common/ScreenHeader';

import {
  useMaterialFlashcardsScreen,
} from '../../hooks/useMaterialFlashcardsScreen';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';


type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'MaterialFlashcards'
  >;


const MaterialFlashcardsScreen = ({
  navigation,
  route,
}: Props) => {

  const {
    materialId,
    subjectId,
    subjectName,
  } = route.params;


  // =========================================================
  // SCREEN STATE
  // =========================================================

  const screen =
    useMaterialFlashcardsScreen({
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

      {/* =====================================================
          HEADER
      ====================================================== */}

      <View
        className="
          px-6
          pt-6
        ">

        <ScreenHeader
          title="Flashcards"

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
                bg-violet-50
              ">

              <BrainCircuit
                size={21}
                color="#7C3AED"
                strokeWidth={2.1}
              />

            </View>

          }
        />

      </View>


      {/* =====================================================
          INITIAL LOADING
      ====================================================== */}

      {
        screen.initializing
        &&
        !screen.deck
          ? (

            <FlashcardLoadingState />

          )
          : null
      }


      {/* =====================================================
          ERROR
      ====================================================== */}

      {
        !screen.initializing
        &&
        !screen.deck
        &&
        screen.error
          ? (

            <FlashcardErrorState
              error={
                screen.error
              }

              busy={
                screen.busy
              }

              onRetry={
                screen.retry
              }
            />

          )
          : null
      }


      {/* =====================================================
          FLASHCARD STUDY VIEW
      ====================================================== */}

      {
        screen.deck
        &&
        screen.currentCard
          ? (

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

                {/* ===========================================
                    PROGRESS
                ============================================ */}

                <FlashcardProgress
                  current={
                    screen.displayPosition
                  }

                  total={
                    screen.totalCards
                  }

                  provider={
                    screen.deck.provider
                  }
                />


                {/* ===========================================
                    CURRENT CARD
                ============================================ */}

                <FlashcardStudyCard
                  card={
                    screen.currentCard
                  }

                  answerVisible={
                    screen.answerVisible
                  }

                  onToggle={
                    screen.toggleAnswer
                  }
                />


                {/* ===========================================
                    NAVIGATION
                ============================================ */}

                <FlashcardNavigation
                  canGoPrevious={
                    screen.canGoPrevious
                  }

                  canGoNext={
                    screen.canGoNext
                  }

                  generating={
                    screen.generating
                  }

                  onPrevious={
                    screen.previous
                  }

                  onNext={
                    screen.next
                  }

                  onGenerateAgain={
                    screen.generateAgain
                  }
                />

              </View>

            </ScrollView>

          )
          : null
      }

    </SafeAreaView>
  );
};


export default MaterialFlashcardsScreen;