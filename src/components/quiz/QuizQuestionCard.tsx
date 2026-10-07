import React from 'react';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  MaterialQuizQuestion,
} from '../../domain/models/MaterialQuiz';


interface Props {

  question:
    MaterialQuizQuestion;

  selectedIndex:
    number | null;

  onSelect:
    (
      optionIndex:
        number,
    ) => void;
}


const optionLabels = [
  'A',
  'B',
  'C',
  'D',
];


const QuizQuestionCard = ({
  question,
  selectedIndex,
  onSelect,
}: Props) => {

  return (

    <View
      className="
        rounded-[26px]
        border
        border-slate-200
        bg-white
        p-5
      ">

      <Text
        className="
          text-xs
          font-bold
          uppercase
          tracking-wider
          text-indigo-500
        ">

        Question {question.position}

      </Text>


      <Text
        className="
          mt-3
          text-xl
          font-bold
          leading-7
          text-slate-900
        ">

        {question.question}

      </Text>


      <View
        className="
          mt-6
        ">

        {
          question.options.map(
            (
              option,
              index,
            ) => {

              const selected =
                selectedIndex ===
                index;


              return (

                <Pressable
                  key={
                    `${question.id}-${index}`
                  }

                  accessibilityRole="button"

                  accessibilityState={{
                    selected,
                  }}

                  onPress={() =>
                    onSelect(
                      index,
                    )
                  }

                  className="
                    mb-3
                    min-h-[60px]
                    flex-row
                    items-center
                    rounded-2xl
                    border
                    px-4
                    py-3
                  "

                  style={({
                    pressed,
                  }) => ({

                    borderColor:
                      selected
                        ? '#4F46E5'
                        : '#E2E8F0',

                    backgroundColor:
                      selected
                        ? '#EEF2FF'
                        : '#FFFFFF',

                    opacity:
                      pressed
                        ? 0.8
                        : 1,
                  })}>

                  <View
                    className="
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                    "
                    style={{
                      backgroundColor:
                        selected
                          ? '#4F46E5'
                          : '#F1F5F9',
                    }}>

                    <Text
                      className="
                        text-sm
                        font-bold
                      "
                      style={{
                        color:
                          selected
                            ? '#FFFFFF'
                            : '#475569',
                      }}>

                      {
                        optionLabels[
                          index
                        ]
                      }

                    </Text>

                  </View>


                  <Text
                    className="
                      ml-3
                      flex-1
                      text-[15px]
                      font-semibold
                      leading-5
                    "
                    style={{
                      color:
                        selected
                          ? '#3730A3'
                          : '#334155',
                    }}>

                    {option}

                  </Text>

                </Pressable>
              );
            },
          )
        }

      </View>

    </View>
  );
};


export default QuizQuestionCard;