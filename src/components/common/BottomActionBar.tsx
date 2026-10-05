import React from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import {
  Plus,
} from 'lucide-react-native';

import ActionButton
  from './ActionButton';


interface BottomActionBarProps {
  title: string;

  onPress: () => void;
}


const BottomActionBar = ({
  title,
  onPress,
}: BottomActionBarProps) => {

  return (

    <View
      style={
        styles.container
      }>

      <ActionButton
        title={
          title
        }

        onPress={
          onPress
        }

        tone="primary"

        variant="solid"

        icon={
          <Plus
            size={20}
            color="#FFFFFF"
            strokeWidth={2.5}
          />
        }
      />

    </View>
  );
};


const styles =
  StyleSheet.create({

    container: {

      backgroundColor:
        '#FFFFFF',

      borderTopWidth:
        1,

      borderTopColor:
        '#E2E8F0',

      paddingHorizontal:
        24,

      paddingTop:
        12,

      paddingBottom:
        12,

      elevation:
        8,

      shadowColor:
        '#000000',

      shadowOffset: {
        width:
          0,

        height:
          -2,
      },

      shadowOpacity:
        0.06,

      shadowRadius:
        6,
    },
  });


export default BottomActionBar;