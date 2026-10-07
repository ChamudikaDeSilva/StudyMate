import React, {
  ReactNode,
} from 'react';

import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import ActionButton, {
  ActionButtonTone,
  ActionButtonVariant,
} from './ActionButton';


type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'solid'
  | 'soft'
  | 'outline'
  | 'ghost';


interface AppButtonProps {
  title: string;

  onPress: () => void;

  disabled?: boolean;

  loading?: boolean;

  variant?: ButtonVariant;

  tone?: ActionButtonTone;

  icon?: ReactNode;

  style?: StyleProp<ViewStyle>;

  className?: string;
}


const AppButton = ({
  title,
  onPress,

  disabled = false,

  loading = false,

  variant = 'primary',

  tone = 'primary',

  icon,

  style,

  className = '',
}: AppButtonProps) => {

  let mappedVariant:
    ActionButtonVariant;


  switch (variant) {

    case 'secondary':

      mappedVariant =
        'soft';

      break;


    case 'outline':

      mappedVariant =
        'outline';

      break;


    case 'ghost':

      mappedVariant =
        'ghost';

      break;


    case 'soft':

      mappedVariant =
        'soft';

      break;


    case 'solid':

    case 'primary':

    default:

      mappedVariant =
        'solid';

      break;
  }


  return (

    <View
      className={
        className
      }

      style={[
        styles.container,
        style,
      ]}>

      <ActionButton
        title={
          title
        }

        onPress={
          onPress
        }

        disabled={
          disabled
        }

        loading={
          loading
        }

        tone={
          tone
        }

        variant={
          mappedVariant
        }

        icon={
          icon
        }
      />

    </View>
  );
};


const styles =
  StyleSheet.create({

    container: {

      alignSelf:
        'stretch',

      minWidth:
        0,
    },
  });


export default AppButton;