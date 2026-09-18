import {Platform, ViewStyle} from 'react-native';

export const shadows: Record<string, ViewStyle> = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,

  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ViewStyle,
};