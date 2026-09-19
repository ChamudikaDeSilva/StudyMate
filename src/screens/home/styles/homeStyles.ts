import {StyleSheet} from 'react-native';

import {colors} from '../../../constants/colors';
import {spacing} from '../../../constants/spacing';

export const homeStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // =========================================================
  // Header
  // =========================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: spacing.xl,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },

  greeting: {
    fontSize: 27,
    fontWeight: '700',

    color: colors.textPrimary,

    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: spacing.xs,

    fontSize: 14,
    lineHeight: 20,

    color: colors.textSecondary,
  },

  // AccountMenu needs these

  profileButton: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: colors.primary,

    alignItems: 'center',
    justifyContent: 'center',
  },

  profileButtonPressed: {
    opacity: 0.8,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  profileButtonDisabled: {
    opacity: 0.6,
  },

  profileText: {
    fontSize: 17,
    fontWeight: '700',

    color: '#FFFFFF',
  },

  // =========================================================
  // Hero
  // =========================================================

  heroCard: {
    position: 'relative',

    overflow: 'hidden',

    backgroundColor: '#4F46E5',

    borderRadius: 24,

    padding: spacing.lg,

    marginBottom: spacing.xl,

    minHeight: 260,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: spacing.lg,
  },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    alignSelf: 'flex-start',

    gap: 6,

    paddingHorizontal: 11,
    paddingVertical: 7,

    borderRadius: 20,

    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  aiBadgeText: {
    fontSize: 11,

    fontWeight: '700',

    letterSpacing: 0.7,

    color: '#FFFFFF',
  },

  heroTitle: {
    maxWidth: '80%',

    fontSize: 30,
    lineHeight: 36,

    fontWeight: '700',

    color: '#FFFFFF',

    letterSpacing: -0.6,
  },

  heroDescription: {
    maxWidth: '88%',

    marginTop: spacing.md,

    fontSize: 14,
    lineHeight: 21,

    color: '#E0E7FF',
  },

  heroButton: {
    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',

    gap: spacing.sm,

    marginTop: spacing.lg,

    paddingHorizontal: spacing.md,
    paddingVertical: 12,

    backgroundColor: '#FFFFFF',

    borderRadius: 13,
  },

  heroButtonPressed: {
    opacity: 0.88,
  },

  heroButtonText: {
    fontSize: 14,
    fontWeight: '700',

    color: '#4F46E5',
  },

  heroDecorationOne: {
    position: 'absolute',

    width: 130,
    height: 130,

    borderRadius: 65,

    backgroundColor: 'rgba(255,255,255,0.07)',

    right: -35,
    top: -30,
  },

  heroDecorationTwo: {
    position: 'absolute',

    width: 90,
    height: 90,

    borderRadius: 45,

    backgroundColor: 'rgba(255,255,255,0.06)',

    right: 35,
    bottom: -45,
  },

  // =========================================================
  // Section headings
  // =========================================================

  sectionHeader: {
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',

    color: colors.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 4,

    fontSize: 13,
    lineHeight: 19,

    color: colors.textSecondary,
  },

  // =========================================================
  // Statistics
  // =========================================================

  statsRow: {
    flexDirection: 'row',

    gap: spacing.md,

    marginBottom: spacing.md,
  },

  // =========================================================
  // Subject banner
  // =========================================================

  subjectBanner: {
    flexDirection: 'row',
    alignItems: 'center',

    minHeight: 82,

    padding: spacing.md,

    backgroundColor: colors.surface,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: colors.border,

    marginBottom: spacing.xl,
  },

  subjectBannerIcon: {
    width: 48,
    height: 48,

    borderRadius: 14,

    backgroundColor: '#EEF2FF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.md,
  },

  subjectBannerContent: {
    flex: 1,
  },

  subjectBannerTitle: {
    fontSize: 16,
    fontWeight: '700',

    color: colors.textPrimary,
  },

  subjectBannerDescription: {
    marginTop: 4,

    fontSize: 13,

    color: colors.textSecondary,
  },

  subjectArrow: {
    width: 30,
    height: 30,

    alignItems: 'center',
    justifyContent: 'center',
  },

  subjectArrowText: {
    fontSize: 27,

    color: colors.textMuted,
  },

  cardPressed: {
    opacity: 0.8,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  // =========================================================
  // Quick Actions
  // =========================================================

  quickHeader: {
    marginBottom: spacing.md,
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    rowGap: spacing.md,

    marginBottom: spacing.xl,
  },

  // =========================================================
  // Coming Soon
  // =========================================================

  comingSoonCard: {
    flexDirection: 'row',
    alignItems: 'center',

    padding: spacing.md,

    backgroundColor: '#FAF5FF',

    borderRadius: 18,

    borderWidth: 1,
    borderColor: '#E9D5FF',
  },

  comingSoonIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: '#F3E8FF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.md,
  },

  comingSoonContent: {
    flex: 1,
  },

  comingSoonTitle: {
    fontSize: 14,
    fontWeight: '700',

    color: colors.textPrimary,
  },

  comingSoonDescription: {
    marginTop: 4,

    fontSize: 12,
    lineHeight: 18,

    color: colors.textSecondary,
  },
});