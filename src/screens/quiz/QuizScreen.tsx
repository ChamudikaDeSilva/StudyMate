import React from 'react';

import {
  SafeAreaView,
  Text,
  View,
} from 'react-native';

import {
  BrainCircuit,
  Sparkles,
} from 'lucide-react-native';

const QuizScreen = () => {
  return (
    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

      <View
        className="
          flex-1
          px-6
          pt-6
        ">

        <Text
          className="
            text-[26px]
            font-bold
            text-slate-900
          ">
          Quiz
        </Text>

        <Text
          className="
            mt-2
            text-sm
            leading-[21px]
            text-slate-500
          ">
          Turn your learning
          materials into interactive
          quizzes.
        </Text>

        <View
          className="
            mt-10
            items-center
            rounded-3xl
            border
            border-slate-200
            bg-white
            px-6
            py-10
          ">

          <View
            className="
              h-16
              w-16
              items-center
              justify-center
              rounded-[20px]
              bg-indigo-50
            ">

            <BrainCircuit
              size={31}
              color="#4F46E5"
            />

          </View>

          <Text
            className="
              mt-5
              text-lg
              font-bold
              text-slate-900
            ">
            Quizzes are coming next
          </Text>

          <Text
            className="
              mt-2
              max-w-[290px]
              text-center
              text-sm
              leading-5
              text-slate-500
            ">
            Quiz generation will
            become available after
            Materials and the AI
            service are connected.
          </Text>

          <View
            className="
              mt-6
              flex-row
              items-center
              rounded-full
              bg-purple-50
              px-4
              py-2
            ">

            <Sparkles
              size={15}
              color="#7C3AED"
            />

            <Text
              className="
                ml-2
                text-xs
                font-semibold
                text-purple-700
              ">
              AI-powered study tool
            </Text>

          </View>

        </View>

      </View>

    </SafeAreaView>
  );
};

export default QuizScreen;