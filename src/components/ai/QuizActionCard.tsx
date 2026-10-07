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


const QuizActionCard = ({
  disabled,
  onPress,
}: Props) => {

  return (

    <Pressable
      accessibilityRole="button"

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
        border-indigo-100
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
      })}>

      <View
        className="
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-indigo-50
        ">

        <BrainCircuit
          size={23}
          color="#4F46E5"
        />

      </View>


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

          AI Quiz

        </Text>


        <Text
          className="
            mt-1
            text-sm
            leading-5
            text-slate-500
          ">

          Test yourself with AI-generated multiple-choice questions.

        </Text>

      </View>


      <ChevronRight
        size={20}
        color="#94A3B8"
      />

    </Pressable>
  );
};


export default QuizActionCard;