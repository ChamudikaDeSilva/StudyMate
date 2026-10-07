import React from 'react';

import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';


const QuizLoadingState =
  () => {

    return (

      <View
        className="
          flex-1
          items-center
          justify-center
          px-8
        ">

        <ActivityIndicator
          size="large"
          color="#4F46E5"
        />


        <Text
          className="
            mt-6
            text-xl
            font-bold
            text-slate-900
          ">

          Preparing quiz

        </Text>


        <Text
          className="
            mt-2
            text-center
            text-sm
            leading-5
            text-slate-500
          ">

          Checking for a saved quiz or creating one from your material.

        </Text>

      </View>
    );
  };


export default QuizLoadingState;