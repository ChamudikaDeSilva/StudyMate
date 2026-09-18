import {StyleSheet} from 'react-native';

import {colors} from '../../../constants/colors';
import {spacing} from '../../../constants/spacing';
import {radius} from '../../../constants/radius';
import {typography} from '../../../constants/typography';

export const authStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  /*
   * Branding
   */
  brandContainer: {
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },

  logo: {
    width: 72,
    height: 48,
    marginBottom: spacing.xs,
  },

  brandName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  /*
   * Heading
   */
  headingContainer: {
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: spacing.sm,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  /*
   * Form
   */
  form: {
    width: '100%',
  },

  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },

  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  /*
   * Bottom registration prompt
   */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },

  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  footerLink: {
    marginLeft: spacing.xs,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});