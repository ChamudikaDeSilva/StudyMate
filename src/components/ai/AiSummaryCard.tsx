import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import {
  Sparkles,
} from 'lucide-react-native';


type Props = {
  summary: string;
};


const AiSummaryCard = ({
  summary,
}: Props) => {

  return (
    <View
      className="
        rounded-[20px]
        border
        border-indigo-100
        bg-white
        p-5
      ">

      <View
        className="
          mb-4
          flex-row
          items-center
        ">

        <View
          className="
            mr-3
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-indigo-50
          ">

          <Sparkles
            size={20}
            color="#4F46E5"
            strokeWidth={2.2}
          />

        </View>


        <View className="flex-1">

          <Text
            className="
              text-base
              font-bold
              text-slate-900
            ">
            AI Summary
          </Text>

          <Text
            className="
              mt-0.5
              text-xs
              text-slate-500
            ">
            Concise overview of this material
          </Text>

        </View>

      </View>


      <Text
        className="
          text-[15px]
          leading-6
          text-slate-700
        ">
        {summary}
      </Text>

    </View>
  );
};


export default AiSummaryCard;