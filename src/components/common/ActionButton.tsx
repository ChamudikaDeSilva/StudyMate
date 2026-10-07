import React, {
  ReactNode,
} from 'react';

import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';


export type ActionButtonTone =
  | 'primary'
  | 'info'
  | 'success'
  | 'danger'
  | 'neutral';


export type ActionButtonVariant =
  | 'solid'
  | 'soft'
  | 'outline'
  | 'ghost';


interface ActionButtonProps {
  title: string;

  onPress: () => void;

  disabled?: boolean;

  loading?: boolean;

  tone?: ActionButtonTone;

  variant?: ActionButtonVariant;

  icon?: ReactNode;

  style?: StyleProp<ViewStyle>;
}


const toneConfig: Record<
  ActionButtonTone,
  {
    main: string;
    soft: string;
  }
> = {

  primary: {
    main: '#4F46E5',
    soft: '#EEF2FF',
  },

  info: {
    main: '#0284C7',
    soft: '#E0F2FE',
  },

  success: {
    main: '#16A34A',
    soft: '#F0FDF4',
  },

  danger: {
    main: '#DC2626',
    soft: '#FEF2F2',
  },

  neutral: {
    main: '#475569',
    soft: '#F1F5F9',
  },
};


const ActionButton = ({
  title,
  onPress,

  disabled = false,

  loading = false,

  tone = 'primary',

  variant = 'solid',

  icon,

  style,
}: ActionButtonProps) => {

  const palette =
    toneConfig[tone];


  const isDisabled =
    disabled ||
    loading;


  const backgroundColor =

    variant === 'solid'
      ? palette.main

      : variant === 'soft'
        ? palette.soft

        : 'transparent';


  const textColor =

    variant === 'solid'
      ? '#FFFFFF'

      : palette.main;


  const borderWidth =
    variant === 'outline'
      ? 1
      : 0;


  const borderColor =
    variant === 'outline'
      ? palette.main
      : 'transparent';


  return (

    <TouchableOpacity
      accessibilityRole="button"

      accessibilityState={{
        disabled:
          isDisabled,

        busy:
          loading,
      }}

      activeOpacity={0.78}

      disabled={
        isDisabled
      }

      onPress={
        onPress
      }

      style={[
        styles.button,

        {
          backgroundColor,

          borderWidth,

          borderColor,

          opacity:
            isDisabled
              ? 0.45
              : 1,
        },

        style,
      ]}>

      {loading ? (

        <ActivityIndicator
          size="small"
          color={
            textColor
          }
        />

      ) : (

        <>

          {!!icon && (

            <View
              style={
                styles.icon
              }>

              {icon}

            </View>

          )}


          <Text
            style={[
              styles.text,

              {
                color:
                  textColor,
              },
            ]}>

            {title}

          </Text>

        </>

      )}

    </TouchableOpacity>
  );
};


const styles =
  StyleSheet.create({

    button: {

      minHeight:
        54,

      alignSelf:
        'stretch',

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        20,

      borderRadius:
        14,
    },


    icon: {

      marginRight:
        8,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    text: {

      fontSize:
        15,

      fontWeight:
        '700',
    },
  });


export default ActionButton;