import {colors} from '../constants/colors';
import {radius} from '../constants/radius';
import {shadows} from '../constants/shadows';
import {spacing} from '../constants/spacing';
import {typography} from '../constants/typography';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
};

export type AppTheme = typeof theme;