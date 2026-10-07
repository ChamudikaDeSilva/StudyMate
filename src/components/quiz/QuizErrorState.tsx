import React from 'react';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  RefreshCw,
} from 'lucide-react-native';


interface Props {

  error:
    string;

  busy:
    boolean;

  onRetry:
    () => void;
}


const QuizErrorState = ({
  error,
  busy,
  onRetry,
}: Props) => {

  return (

    <View
      className="
        flex-1
        items-center
        justify-center
        px-7
      ">

      <View
        className="
          w-full
          rounded-[24px]
          border
          border-rose-100
          bg-white
          p-6
        ">

        <Text
          className="
            text-lg
            font-bold
            text-slate-900
          ">

          Couldn't load quiz

        </Text>


        <Text
          className="
            mt-2
            text-sm
            leading-5
            text-slate-500
          ">

          {error}

        </Text>


        <Pressable
          disabled={
            busy
          }

          onPress={
            onRetry
          }

          className="
            mt-5
            flex-row
            items-center
            justify-center
            rounded-2xl
            bg-indigo-600
            px-5
            py-4
          ">

          <RefreshCw
            size={18}
            color="#FFFFFF"
          />


          <Text
            className="
              ml-2
              text-sm
              font-bold
              text-white
            ">

            Try Again

          </Text>

        </Pressable>

      </View>

    </View>
  );
};


export default QuizErrorState;