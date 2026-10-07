import React from 'react';

import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';


const FlashcardLoadingState =
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
            h-20
            w-20
            items-center
            justify-center
            rounded-[24px]
            bg-indigo-50
          ">

          <ActivityIndicator
            size="large"
            color="#4F46E5"
          />

        </View>


        <Text
          className="
            mt-6
            text-xl
            font-bold
            text-slate-900
          ">

          Preparing flashcards

        </Text>


        <Text
          className="
            mt-2
            text-center
            text-sm
            leading-5
            text-slate-500
          ">

          Checking for a saved deck or creating one from your study material.

        </Text>

      </View>
    );
  };


export default FlashcardLoadingState;