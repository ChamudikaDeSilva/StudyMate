import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import {
  Lightbulb,
  Sparkle,
} from 'lucide-react-native';


type Props = {
  tips: string[];
};


const AiStudyTipsCard = ({
  tips,
}: Props) => {

  if (
    tips.length === 0
  ) {
    return null;
  }


  return (
    <View
      className="
        rounded-[20px]
        border
        border-amber-200
        bg-amber-50
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
            bg-amber-100
          ">

          <Lightbulb
            size={20}
            color="#D97706"
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
            Study Tips
          </Text>

          <Text
            className="
              mt-0.5
              text-xs
              text-slate-600
            ">
            Suggestions for effective revision
          </Text>

        </View>

      </View>


      <View className="gap-3">

        {tips.map(
          (
            tip,
            index,
          ) => (

            <View
              key={`${index}-${tip}`}
              className="
                flex-row
                items-start
              ">

              <View
                className="
                  mr-3
                  mt-1
                ">

                <Sparkle
                  size={15}
                  color="#D97706"
                  strokeWidth={2}
                />

              </View>


              <Text
                className="
                  flex-1
                  text-sm
                  leading-[21px]
                  text-slate-700
                ">
                {tip}
              </Text>

            </View>

          ),
        )}

      </View>

    </View>
  );
};


export default AiStudyTipsCard;