import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import {
  CheckCircle2,
  ListChecks,
} from 'lucide-react-native';


type Props = {
  points: string[];
};


const AiKeyPointsCard = ({
  points,
}: Props) => {

  if (
    points.length === 0
  ) {
    return null;
  }


  return (
    <View
      className="
        rounded-[20px]
        border
        border-slate-200
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
            bg-emerald-50
          ">

          <ListChecks
            size={20}
            color="#059669"
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
            Key Points
          </Text>

          <Text
            className="
              mt-0.5
              text-xs
              text-slate-500
            ">
            Important concepts to remember
          </Text>

        </View>

      </View>


      <View className="gap-3">

        {points.map(
          (
            point,
            index,
          ) => (

            <View
              key={`${index}-${point}`}
              className="
                flex-row
                items-start
              ">

              <View
                className="
                  mr-3
                  mt-0.5
                ">

                <CheckCircle2
                  size={18}
                  color="#059669"
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
                {point}
              </Text>

            </View>

          ),
        )}

      </View>

    </View>
  );
};


export default AiKeyPointsCard;