import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import {
  CheckCircle2,
} from 'lucide-react-native';


interface Props {

  score:
    number;

  total:
    number;

  percentage:
    number;
}


const QuizScoreCard = ({
  score,
  total,
  percentage,
}: Props) => {

  const message =
    percentage >= 80
      ? 'Great work!'
      : percentage >= 60
        ? 'Good progress.'
        : 'Keep reviewing.';


  return (

    <View
      className="
        items-center
        rounded-[28px]
        border
        border-emerald-100
        bg-white
        p-7
      ">

      <View
        className="
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-emerald-50
        ">

        <CheckCircle2
          size={32}
          color="#059669"
        />

      </View>


      <Text
        className="
          mt-4
          text-4xl
          font-black
          text-slate-900
        ">

        {percentage.toFixed(0)}%

      </Text>


      <Text
        className="
          mt-2
          text-base
          font-bold
          text-slate-700
        ">

        {score} of {total} correct

      </Text>


      <Text
        className="
          mt-1
          text-sm
          text-slate-500
        ">

        {message}

      </Text>

    </View>
  );
};


export default QuizScoreCard;