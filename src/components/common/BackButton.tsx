import React from 'react';

import {
  Pressable,
  StyleSheet,
} from 'react-native';

import {
  ArrowLeft,
} from 'lucide-react-native';


interface BackButtonProps {

  onPress:
    () => void;
}


const BackButton = ({
  onPress,
}: BackButtonProps) => {

  return (

    <Pressable
      accessibilityRole="button"

      accessibilityLabel="Go back"

      hitSlop={12}

      onPress={
        onPress
      }

      style={({
        pressed,
      }) => [

        styles.button,

        {
          opacity:
            pressed
              ? 0.65
              : 1,

          transform: [
            {
              scale:
                pressed
                  ? 0.95
                  : 1,
            },
          ],
        },
      ]}>

      <ArrowLeft
        size={22}
        color="#0F172A"
        strokeWidth={2.2}
      />

    </Pressable>
  );
};


const styles =
  StyleSheet.create({

    button: {

      width:
        44,

      height:
        44,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        12,

      borderWidth:
        1,

      borderColor:
        '#E2E8F0',

      backgroundColor:
        '#FFFFFF',

      elevation:
        2,

      shadowColor:
        '#000000',

      shadowOffset: {
        width:
          0,

        height:
          1,
      },

      shadowOpacity:
        0.05,

      shadowRadius:
        2,
    },
  });


export default BackButton;