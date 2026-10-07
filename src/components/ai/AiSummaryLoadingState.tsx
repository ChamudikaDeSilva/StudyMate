import React from 'react';

import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

import {
  Sparkles,
} from 'lucide-react-native';


const AiSummaryLoadingState =
  () => {

    return (

      <View
        className="
          flex-1
          items-center
          justify-center
          px-8
        ">

        <View
          className="
            mb-5
            h-16
            w-16
            items-center
            justify-center
            rounded-[22px]
            bg-indigo-50
          ">

          <ActivityIndicator
            size="small"
            color="#4F46E5"
          />

        </View>


        <Text
          className="
            text-lg
            font-bold
            text-slate-900
          ">

          Creating your summary

        </Text>


        <Text
          className="
            mt-2
            text-center
            text-sm
            leading-5
            text-slate-500
          ">

          LearnLoop AI is reading
          your material and identifying
          the most important concepts.

        </Text>


        <View
          className="
            mt-6
            flex-row
            items-center
            rounded-full
            bg-indigo-50
            px-4
            py-2
          ">

          <Sparkles
            size={15}
            color="#4F46E5"
          />


          <Text
            className="
              ml-2
              text-xs
              font-semibold
              text-indigo-600
            ">

            AI processing

          </Text>

        </View>

      </View>
    );
  };


export default AiSummaryLoadingState;