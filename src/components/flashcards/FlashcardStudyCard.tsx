import React from 'react';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  BrainCircuit,
} from 'lucide-react-native';

import {
  Flashcard,
} from '../../domain/models/MaterialFlashcards';


interface Props {

  card:
    Flashcard;

  answerVisible:
    boolean;

  onToggle:
    () => void;
}


const FlashcardStudyCard = ({
  card,
  answerVisible,
  onToggle,
}: Props) => {

  return (

    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        answerVisible
          ? 'Hide flashcard answer'
          : 'Reveal flashcard answer'
      }
      onPress={
        onToggle
      }
      className="
        min-h-[330px]
        rounded-[28px]
        border
        border-indigo-100
        bg-white
        p-6
      "
      style={({
        pressed,
      }) => ({

        opacity:
          pressed
            ? 0.94
            : 1,

        transform: [
          {
            scale:
              pressed
                ? 0.99
                : 1,
          },
        ],
      })}>

      <View
        className="
          flex-row
          items-center
          justify-between
        ">

        <View
          className="
            rounded-xl
            bg-indigo-50
            px-3
            py-2
          ">

          <Text
            className="
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-indigo-600
            ">

            {
              answerVisible
                ? 'Answer'
                : 'Question'
            }

          </Text>

        </View>


        <View
          className="
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-violet-50
          ">

          <BrainCircuit
            size={19}
            color="#7C3AED"
            strokeWidth={2.1}
          />

        </View>

      </View>


      <View
        className="
          flex-1
          items-center
          justify-center
          py-8
        ">

        <Text
          className="
            text-center
            text-[22px]
            font-bold
            leading-8
            text-slate-900
          ">

          {
            answerVisible
              ? card.back
              : card.front
          }

        </Text>

      </View>


      <View
        className="
          border-t
          border-slate-100
          pt-4
        ">

        <Text
          className="
            text-center
            text-sm
            font-medium
            text-slate-400
          ">

          {
            answerVisible
              ? 'Tap to show the question'
              : 'Tap to reveal the answer'
          }

        </Text>

      </View>

    </Pressable>
  );
};


export default FlashcardStudyCard;