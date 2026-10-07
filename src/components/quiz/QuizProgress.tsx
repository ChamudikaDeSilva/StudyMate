import React from 'react';

import {
  Text,
  View,
} from 'react-native';


interface Props {

  current:
    number;

  total:
    number;

  answered:
    number;

  provider:
    string;
}


const QuizProgress = ({
  current,
  total,
  answered,
  provider,
}: Props) => {

  const percentage =
    total > 0
      ? (
          current
          /
          total
        ) * 100
      : 0;


  return (

    <View
      className="
        mb-5
        rounded-[20px]
        border
        border-slate-200
        bg-white
        p-5
      ">

      <View
        className="
          flex-row
          items-center
          justify-between
        ">

        <View>

          <Text
            className="
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-slate-400
            ">

            Quiz progress

          </Text>


          <Text
            className="
              mt-1
              text-lg
              font-bold
              text-slate-900
            ">

            Question {current} of {total}

          </Text>


          <Text
            className="
              mt-1
              text-xs
              text-slate-500
            ">

            {answered} answered

          </Text>

        </View>


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
              text-indigo-600
            ">

            {provider}

          </Text>

        </View>

      </View>


      <View
        className="
          mt-4
          h-2
          overflow-hidden
          rounded-full
          bg-slate-100
        ">

        <View
          className="
            h-full
            rounded-full
            bg-indigo-600
          "
          style={{
            width:
              `${percentage}%`,
          }}
        />

      </View>

    </View>
  );
};


export default QuizProgress;