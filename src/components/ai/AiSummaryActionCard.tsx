import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import {
  BrainCircuit,
  Sparkles,
} from 'lucide-react-native';

import ActionButton from '../common/ActionButton';


type Props = {
  onPress: () => void;

  disabled?: boolean;
};


const AiSummaryActionCard = ({
  onPress,
  disabled = false,
}: Props) => {

  return (
    <View
      className="
        rounded-[20px]
        border
        border-indigo-200
        bg-indigo-50
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
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            bg-indigo-100
          ">

          <BrainCircuit
            size={22}
            color="#4F46E5"
            strokeWidth={2.1}
          />

        </View>


        <View className="flex-1">

          <Text
            className="
              text-base
              font-bold
              text-slate-900
            ">

            AI Study Summary

          </Text>


          <Text
            className="
              mt-1
              text-xs
              leading-[18px]
              text-slate-600
            ">

            Turn this material into a concise
            summary, key points and study tips.

          </Text>

        </View>


        <Sparkles
          size={20}
          color="#6366F1"
        />

      </View>


      <ActionButton
        title="Generate AI Summary"
        onPress={onPress}
        disabled={disabled}
        tone="primary"
        variant="solid"
        icon={
          <Sparkles
            size={18}
            color="#FFFFFF"
          />
        }
      />

    </View>
  );
};


export default AiSummaryActionCard;