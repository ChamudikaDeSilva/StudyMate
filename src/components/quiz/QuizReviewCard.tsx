import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import {
  QuizAnswerResult,
} from '../../domain/models/MaterialQuiz';


interface Props {

  answer:
    QuizAnswerResult;
}


const optionLabels = [
  'A',
  'B',
  'C',
  'D',
];


const QuizReviewCard = ({
  answer,
}: Props) => {

  return (

    <View
      className="
        mb-4
        rounded-[22px]
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
          text-slate-400
        ">

        Question {answer.position}

      </Text>


      <Text
        className="
          mt-2
          text-base
          font-bold
          leading-6
          text-slate-900
        ">

        {answer.question}

      </Text>


      <View
        className="
          mt-4
        ">

        {
          answer.options.map(
            (
              option,
              index,
            ) => {

              const correct =
                index ===
                answer.correctIndex;


              const selected =
                index ===
                answer.selectedIndex;


              const selectedWrong =
                selected
                &&
                !correct;


              return (

                <View
                  key={
                    `${answer.questionId}-${index}`
                  }

                  className="
                    mb-2
                    rounded-xl
                    border
                    px-4
                    py-3
                  "

                  style={{

                    borderColor:
                      correct
                        ? '#86EFAC'
                        : selectedWrong
                          ? '#FDA4AF'
                          : '#E2E8F0',

                    backgroundColor:
                      correct
                        ? '#F0FDF4'
                        : selectedWrong
                          ? '#FFF1F2'
                          : '#FFFFFF',
                  }}>

                  <Text
                    className="
                      text-sm
                      font-semibold
                      leading-5
                    "
                    style={{

                      color:
                        correct
                          ? '#15803D'
                          : selectedWrong
                            ? '#BE123C'
                            : '#475569',
                    }}>

                    {optionLabels[index]}. {option}

                  </Text>


                  {
                    correct
                      ? (

                        <Text
                          className="
                            mt-1
                            text-xs
                            font-bold
                            text-emerald-600
                          ">

                          Correct answer

                        </Text>

                      )
                      : selectedWrong
                        ? (

                          <Text
                            className="
                              mt-1
                              text-xs
                              font-bold
                              text-rose-600
                            ">

                            Your answer

                          </Text>

                        )
                        : null
                  }

                </View>
              );
            },
          )
        }

      </View>


      {
        answer.selectedIndex ===
          null
          ? (

            <Text
              className="
                mt-1
                text-sm
                font-semibold
                text-amber-600
              ">

              You did not answer this question.

            </Text>

          )
          : null
      }


      <View
        className="
          mt-3
          rounded-xl
          bg-slate-50
          p-4
        ">

        <Text
          className="
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-slate-400
          ">

          Explanation

        </Text>


        <Text
          className="
            mt-2
            text-sm
            leading-5
            text-slate-600
          ">

          {answer.explanation}

        </Text>

      </View>

    </View>
  );
};


export default QuizReviewCard;