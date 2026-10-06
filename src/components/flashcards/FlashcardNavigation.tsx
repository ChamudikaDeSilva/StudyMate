import React from 'react';

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react-native';


interface Props {

  canGoPrevious:
    boolean;

  canGoNext:
    boolean;

  generating:
    boolean;

  onPrevious:
    () => void;

  onNext:
    () => void;

  onGenerateAgain:
    () => void;
}


const FlashcardNavigation = ({
  canGoPrevious,
  canGoNext,
  generating,
  onPrevious,
  onNext,
  onGenerateAgain,
}: Props) => {

  return (

    <View
      className="
        mt-5
      ">

      {/* =====================================================
          PREVIOUS / NEXT
      ====================================================== */}

      <View
        className="
          flex-row
          gap-3
        ">

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous flashcard"
          disabled={
            !canGoPrevious
          }
          onPress={
            onPrevious
          }
          className="
            flex-1
            flex-row
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-4
            py-4
          "
          style={({
            pressed,
          }) => ({

            opacity:
              !canGoPrevious
                ? 0.4
                : pressed
                  ? 0.75
                  : 1,
          })}>

          <ChevronLeft
            size={19}
            color="#334155"
          />


          <Text
            className="
              ml-1
              text-sm
              font-bold
              text-slate-700
            ">

            Previous

          </Text>

        </Pressable>


        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next flashcard"
          disabled={
            !canGoNext
          }
          onPress={
            onNext
          }
          className="
            flex-1
            flex-row
            items-center
            justify-center
            rounded-2xl
            bg-indigo-600
            px-4
            py-4
          "
          style={({
            pressed,
          }) => ({

            opacity:
              !canGoNext
                ? 0.4
                : pressed
                  ? 0.8
                  : 1,
          })}>

          <Text
            className="
              mr-1
              text-sm
              font-bold
              text-white
            ">

            Next

          </Text>


          <ChevronRight
            size={19}
            color="#FFFFFF"
          />

        </Pressable>

      </View>


      {/* =====================================================
          GENERATE AGAIN
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Generate flashcards again"
        disabled={
          generating
        }
        onPress={
          onGenerateAgain
        }
        className="
          mt-4
          flex-row
          items-center
          justify-center
          rounded-2xl
          border
          border-indigo-200
          bg-indigo-50
          px-5
          py-4
        "
        style={({
          pressed,
        }) => ({

          opacity:
            generating
              ? 0.6
              : pressed
                ? 0.8
                : 1,
        })}>

        {
          generating
            ? (

              <ActivityIndicator
                size="small"
                color="#4F46E5"
              />

            )
            : (

              <RefreshCw
                size={18}
                color="#4F46E5"
              />

            )
        }


        <Text
          className="
            ml-2
            text-sm
            font-bold
            text-indigo-600
          ">

          {
            generating
              ? 'Generating...'
              : 'Generate Again'
          }

        </Text>

      </Pressable>

    </View>
  );
};


export default FlashcardNavigation;