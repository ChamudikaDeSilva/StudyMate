import React from 'react';

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';


interface Props {

  canGoPrevious:
    boolean;

  canGoNext:
    boolean;

  isLastQuestion:
    boolean;

  submitting:
    boolean;

  onPrevious:
    () => void;

  onNext:
    () => void;

  onSubmit:
    () => void;
}


const QuizNavigation = ({
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  submitting,
  onPrevious,
  onNext,
  onSubmit,
}: Props) => {

  return (

    <View
      className="
        mt-5
        flex-row
        gap-3
      ">

      <Pressable
        disabled={
          !canGoPrevious
          ||
          submitting
        }

        onPress={
          onPrevious
        }

        className="
          flex-1
          flex-row
          items-center
          justify-center
          rounded-2xl
          border
          border-slate-200
          bg-white
          px-4
          py-4
        "

        style={({
          pressed,
        }) => ({

          opacity:
            !canGoPrevious
            ||
            submitting
              ? 0.4
              : pressed
                ? 0.75
                : 1,
        })}>

        <ChevronLeft
          size={18}
          color="#334155"
        />


        <Text
          className="
            ml-1
            text-sm
            font-bold
            text-slate-700
          ">

          Previous

        </Text>

      </Pressable>


      {
        isLastQuestion
          ? (

            <Pressable
              disabled={
                submitting
              }

              onPress={
                onSubmit
              }

              className="
                flex-1
                flex-row
                items-center
                justify-center
                rounded-2xl
                bg-emerald-600
                px-4
                py-4
              "

              style={({
                pressed,
              }) => ({

                opacity:
                  submitting
                    ? 0.6
                    : pressed
                      ? 0.8
                      : 1,
              })}>

              {
                submitting
                  ? (

                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                  )
                  : (

                    <CheckCircle2
                      size={18}
                      color="#FFFFFF"
                    />

                  )
              }


              <Text
                className="
                  ml-2
                  text-sm
                  font-bold
                  text-white
                ">

                {
                  submitting
                    ? 'Submitting...'
                    : 'Submit Quiz'
                }

              </Text>

            </Pressable>

          )
          : (

            <Pressable
              disabled={
                !canGoNext
                ||
                submitting
              }

              onPress={
                onNext
              }

              className="
                flex-1
                flex-row
                items-center
                justify-center
                rounded-2xl
                bg-indigo-600
                px-4
                py-4
              "

              style={({
                pressed,
              }) => ({

                opacity:
                  !canGoNext
                  ||
                  submitting
                    ? 0.4
                    : pressed
                      ? 0.8
                      : 1,
              })}>

              <Text
                className="
                  mr-1
                  text-sm
                  font-bold
                  text-white
                ">

                Next

              </Text>


              <ChevronRight
                size={18}
                color="#FFFFFF"
              />

            </Pressable>

          )
      }

    </View>
  );
};


export default QuizNavigation;