import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import {
  Sparkles,
} from 'lucide-react-native';

import {
  MaterialSummary,
} from '../../domain/models/MaterialSummary';


interface Props {

  summary:
    MaterialSummary;

  fallbackTitle:
    string;
}


const AiSummaryOverviewCard = ({
  summary,
  fallbackTitle,
}: Props) => {

  const displayTitle =
    summary.title ||
    fallbackTitle;


  const providerLabel =
    summary.provider
      ? (
          summary.provider
            .charAt(0)
            .toUpperCase()

          +

          summary.provider
            .slice(1)
        )

      : 'AI';


  return (

    <View
      className="
        overflow-hidden
        rounded-[20px]
        bg-indigo-600
        p-5
      ">

      <View
        className="
          flex-row
          items-center
        ">

        <View
          className="
            mr-4
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-white/15
          ">

          <Sparkles
            size={23}
            color="#FFFFFF"
          />

        </View>


        <View
          className="
            flex-1
          ">

          <Text
            className="
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-indigo-100
            ">

            AI STUDY SUMMARY

          </Text>


          <Text
            className="
              mt-1
              text-lg
              font-bold
              text-white
            "
            numberOfLines={2}>

            {displayTitle}

          </Text>

        </View>

      </View>


      <View
        className="
          mt-5
          flex-row
        ">

        {/* PROVIDER */}

        <View
          className="
            mr-3
            rounded-xl
            bg-white/10
            px-3
            py-2
          ">

          <Text
            className="
              text-[10px]
              font-semibold
              uppercase
              text-indigo-100
            ">

            Provider

          </Text>


          <Text
            className="
              mt-0.5
              text-xs
              font-bold
              text-white
            ">

            {providerLabel}

          </Text>

        </View>


        {/* CHARACTER COUNT */}

        <View
          className="
            rounded-xl
            bg-white/10
            px-3
            py-2
          ">

          <Text
            className="
              text-[10px]
              font-semibold
              uppercase
              text-indigo-100
            ">

            Source text

          </Text>


          <Text
            className="
              mt-0.5
              text-xs
              font-bold
              text-white
            ">

            {
              summary
                .extractedCharacterCount
                .toLocaleString()
            } chars

          </Text>

        </View>

      </View>

    </View>
  );
};


export default AiSummaryOverviewCard;