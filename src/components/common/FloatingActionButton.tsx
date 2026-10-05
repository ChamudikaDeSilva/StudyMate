import React from 'react';

import {
  Pressable,
  StyleSheet,
} from 'react-native';

import {
  Plus,
} from 'lucide-react-native';


interface FloatingActionButtonProps {

  onPress:
    () => void;

  accessibilityLabel:
    string;
}


const FloatingActionButton = ({
  onPress,
  accessibilityLabel,
}: FloatingActionButtonProps) => {

  return (

    <Pressable
      accessibilityRole="button"

      accessibilityLabel={
        accessibilityLabel
      }

      hitSlop={10}

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
              ? 0.82

              : 1,

          transform: [
            {
              scale:
                pressed
                  ? 0.94

                  : 1,
            },
          ],
        },
      ]}>

      <Plus
        size={28}
        color="#FFFFFF"
        strokeWidth={2.4}
      />

    </Pressable>
  );
};


const styles =
  StyleSheet.create({

    button: {

      position:
        'absolute',

      right:
        24,

      /*
       * IMPORTANT:
       *
       * Bottom tab = about 76px.
       *
       * 76 + 16px spacing = 92px.
       *
       * So the FAB now sits ABOVE
       * the tab bar instead of behind it.
       */
      bottom:
        92,

      width:
        62,

      height:
        62,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        20,

      backgroundColor:
        '#4F46E5',

      zIndex:
        9999,

      elevation:
        20,

      shadowColor:
        '#000000',

      shadowOffset: {
        width:
          0,

        height:
          6,
      },

      shadowOpacity:
        0.22,

      shadowRadius:
        9,
    },
  });


export default FloatingActionButton;