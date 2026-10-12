import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

export const shadows: Record<string, ViewStyle> = {
  sm: Platform.select({
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
    },
    android: { elevation: 1, shadowColor: colors.primary },
    default: {},
  }) as ViewStyle,
  md: Platform.select({
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    android: { elevation: 3, shadowColor: colors.primary },
    default: {},
  }) as ViewStyle,
};
