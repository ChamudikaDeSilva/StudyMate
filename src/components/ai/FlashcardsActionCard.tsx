import React from 'react';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  BrainCircuit,
  ChevronRight,
} from 'lucide-react-native';


interface Props {

  disabled:
    boolean;

  onPress:
    () => void;
}


const FlashcardsActionCard = ({
  disabled,
  onPress,
}: Props) => {

  return (

    <Pressable
      accessibilityRole="button"

      accessibilityLabel="Open AI flashcards"

      accessibilityState={{
        disabled,
      }}

      disabled={
        disabled
      }

      onPress={
        onPress
      }

      className="
        mt-3
        flex-row
        items-center
        rounded-[20px]
        border
        border-violet-100
        bg-white
        p-4
      "

      style={({
        pressed,
      }) => ({

        opacity:
          disabled
            ? 0.45
            : pressed
              ? 0.8
              : 1,

        transform: [
          {
            scale:
              pressed
              &&
              !disabled
                ? 0.99
                : 1,
          },
        ],
      })}>

      {/* =====================================================
          ICON
      ====================================================== */}

      <View
        className="
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-violet-50
        ">

        <BrainCircuit
          size={23}
          color="#7C3AED"
          strokeWidth={2.1}
        />

      </View>


      {/* =====================================================
          TEXT
      ====================================================== */}

      <View
        className="
          ml-4
          flex-1
        ">

        <Text
          className="
            text-base
            font-bold
            text-slate-900
          ">

          AI Flashcards

        </Text>


        <Text
          className="
            mt-1
            text-sm
            leading-5
            text-slate-500
          ">

          Turn this material into active-recall study cards.

        </Text>

      </View>


      {/* =====================================================
          ARROW
      ====================================================== */}

      <ChevronRight
        size={20}
        color="#94A3B8"
      />

    </Pressable>
  );
};


export default FlashcardsActionCard;