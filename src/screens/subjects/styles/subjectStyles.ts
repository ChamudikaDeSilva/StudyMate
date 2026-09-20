import {StyleSheet} from 'react-native';

import {colors} from '../../../constants/colors';
import {spacing} from '../../../constants/spacing';

export const subjectStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  screen: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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

  headerTitle: {
    fontSize: 29,

    fontWeight: '700',

    letterSpacing: -0.6,

    color: colors.textPrimary,
  },

  headerSubtitle: {
    marginTop: 5,

    fontSize: 14,
    lineHeight: 20,

    color: colors.textSecondary,
  },

  // =========================================================
  // Overview
  // =========================================================

  overviewCard: {
    position: 'relative',

    overflow: 'hidden',

    minHeight: 145,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#4F46E5',

    borderRadius: 22,

    padding: spacing.lg,

    marginBottom: spacing.lg,
  },

  overviewIcon: {
    width: 52,
    height: 52,

    borderRadius: 16,

    backgroundColor:
      'rgba(255,255,255,0.16)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.md,

    zIndex: 2,
  },

  overviewContent: {
    flex: 1,

    zIndex: 2,
  },

  overviewLabel: {
    fontSize: 10,

    fontWeight: '700',

    letterSpacing: 0.9,

    color: '#C7D2FE',
  },

  overviewNumber: {
    marginTop: 3,

    fontSize: 32,

    fontWeight: '800',

    color: '#FFFFFF',
  },

  overviewDescription: {
    marginTop: 2,

    fontSize: 12,
    lineHeight: 17,

    color: '#E0E7FF',
  },

  overviewDecorationOne: {
    position: 'absolute',

    width: 115,
    height: 115,

    borderRadius: 60,

    right: -30,
    top: -45,

    backgroundColor:
      'rgba(255,255,255,0.07)',
  },

  overviewDecorationTwo: {
    position: 'absolute',

    width: 78,
    height: 78,

    borderRadius: 40,

    right: 32,
    bottom: -40,

    backgroundColor:
      'rgba(255,255,255,0.06)',
  },

  // =========================================================
  // Search
  // =========================================================

  searchContainer: {
    height: 54,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: spacing.md,

    borderRadius: 16,

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,

    marginBottom: spacing.xl,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 6,

    elevation: 1,
  },

  searchInput: {
    flex: 1,

    marginLeft: spacing.sm,

    paddingVertical: 0,

    fontSize: 14,

    color: colors.textPrimary,
  },

  clearSearchButton: {
    width: 30,
    height: 30,

    borderRadius: 15,

    backgroundColor:
      colors.surfaceSecondary,

    alignItems: 'center',
    justifyContent: 'center',
  },

  clearSearchPressed: {
    opacity: 0.7,
  },

  // =========================================================
  // Section
  // =========================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 18,

    fontWeight: '700',

    color: colors.textPrimary,
  },

  countBadge: {
    minWidth: 28,
    height: 24,

    marginLeft: spacing.sm,

    paddingHorizontal: 8,

    borderRadius: 12,

    backgroundColor: '#EEF2FF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    fontSize: 12,

    fontWeight: '700',

    color: '#4F46E5',
  },

  // =========================================================
  // Loading / error
  // =========================================================

  stateContainer: {
    minHeight: 270,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: spacing.xl,
  },

  loadingIcon: {
    width: 54,
    height: 54,

    borderRadius: 17,

    backgroundColor: '#EEF2FF',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: spacing.md,
  },

  errorIcon: {
    width: 54,
    height: 54,

    borderRadius: 17,

    backgroundColor: '#FEF2F2',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: spacing.md,
  },

  stateTitle: {
    fontSize: 17,

    fontWeight: '700',

    color: colors.textPrimary,

    textAlign: 'center',
  },

  stateDescription: {
    marginTop: spacing.sm,

    maxWidth: 280,

    fontSize: 13,
    lineHeight: 19,

    textAlign: 'center',

    color: colors.textSecondary,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: spacing.sm,

    marginTop: spacing.lg,

    paddingHorizontal: spacing.lg,
    paddingVertical: 12,

    borderRadius: 13,

    backgroundColor: '#EEF2FF',
  },

  retryButtonText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#4F46E5',
  },

  // =========================================================
  // Empty state
  // =========================================================

  emptyState: {
    minHeight: 300,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: spacing.xl,
  },

  emptyIconOuter: {
    width: 86,
    height: 86,

    borderRadius: 28,

    backgroundColor: '#F5F3FF',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: spacing.lg,
  },

  emptyIconInner: {
    width: 58,
    height: 58,

    borderRadius: 19,

    backgroundColor: '#EEF2FF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 19,

    fontWeight: '700',

    color: colors.textPrimary,

    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: spacing.sm,

    maxWidth: 300,

    fontSize: 13,
    lineHeight: 20,

    textAlign: 'center',

    color: colors.textSecondary,
  },

  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: spacing.sm,

    marginTop: spacing.lg,

    paddingHorizontal: spacing.lg,
    paddingVertical: 13,

    backgroundColor: '#4F46E5',

    borderRadius: 14,
  },

  emptyButtonText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#FFFFFF',
  },

  // =========================================================
  // Floating button
  // =========================================================

  floatingButton: {
    position: 'absolute',

    right: spacing.lg,
    bottom: spacing.lg,

    width: 62,
    height: 62,

    borderRadius: 20,

    backgroundColor: '#4F46E5',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,

    elevation: 8,
  },

  floatingButtonPressed: {
    opacity: 0.85,

    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  bottomSpace: {
    height: 100,
  },

  // =========================================================
  // Modal
  // =========================================================

  modalKeyboardView: {
    flex: 1,
  },

  modalOverlay: {
    flex: 1,

    justifyContent: 'center',

    backgroundColor:
      'rgba(15, 23, 42, 0.5)',

    paddingHorizontal: spacing.lg,
  },

  modalCard: {
    width: '100%',

    maxWidth: 430,

    alignSelf: 'center',

    padding: spacing.lg,

    borderRadius: 24,

    backgroundColor: colors.surface,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.18,
    shadowRadius: 22,

    elevation: 12,
  },

  modalIcon: {
    width: 52,
    height: 52,

    borderRadius: 16,

    backgroundColor: '#EEF2FF',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: spacing.md,
  },

  modalTitle: {
    fontSize: 22,

    fontWeight: '700',

    letterSpacing: -0.3,

    color: colors.textPrimary,
  },

  modalSubtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,

    fontSize: 13,
    lineHeight: 20,

    color: colors.textSecondary,
  },

  inputLabel: {
    marginBottom: spacing.sm,

    fontSize: 13,

    fontWeight: '600',

    color: colors.textPrimary,
  },

  optionalText: {
    fontWeight: '400',

    color: colors.textMuted,
  },

  modalInput: {
    minHeight: 52,

    marginBottom: spacing.md,

    paddingHorizontal: spacing.md,

    borderRadius: 13,

    borderWidth: 1,
    borderColor: colors.border,

    backgroundColor: '#F8FAFC',

    fontSize: 14,

    color: colors.textPrimary,
  },

  descriptionInput: {
    minHeight: 100,

    paddingTop: spacing.md,

    marginBottom: spacing.xs,
  },

  characterCount: {
    alignSelf: 'flex-end',

    marginBottom: spacing.lg,

    fontSize: 11,

    color: colors.textMuted,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',

    gap: spacing.sm,
  },

  cancelButton: {
    minHeight: 48,

    paddingHorizontal: spacing.lg,

    borderRadius: 13,

    borderWidth: 1,
    borderColor: colors.border,

    backgroundColor: colors.surface,

    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontSize: 14,

    fontWeight: '600',

    color: colors.textPrimary,
  },

  createButton: {
    minHeight: 48,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: spacing.sm,

    minWidth: 145,

    paddingHorizontal: spacing.lg,

    borderRadius: 13,

    backgroundColor: '#4F46E5',
  },

  createButtonDisabled: {
    opacity: 0.45,
  },

  createButtonText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#FFFFFF',
  },

  buttonPressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  secondaryPressed: {
    backgroundColor:
      colors.surfaceSecondary,
  },

  // =========================================================
  // Subject actions bottom sheet
  // =========================================================

  actionModalOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(15, 23, 42, 0.45)',

    justifyContent: 'flex-end',
  },

  actionSheet: {
    backgroundColor: colors.surface,

    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,

    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  actionSheetHandle: {
    width: 42,
    height: 5,

    alignSelf: 'center',

    borderRadius: 3,

    backgroundColor: colors.border,

    marginBottom: spacing.lg,
  },

  actionSheetTitle: {
    fontSize: 19,

    fontWeight: '700',

    color: colors.textPrimary,
  },

  actionSheetSubtitle: {
    marginTop: 4,

    fontSize: 13,

    color: colors.textSecondary,
  },

  actionDivider: {
    height: 1,

    backgroundColor: colors.border,

    marginVertical: spacing.md,
  },

  actionItem: {
    minHeight: 72,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 16,

    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },

  actionItemPressed: {
    backgroundColor: '#EEF2FF',
  },

  deleteActionPressed: {
    backgroundColor: '#FEF2F2',
  },

  editActionIcon: {
    width: 44,
    height: 44,

    borderRadius: 13,

    backgroundColor: '#EEF2FF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.md,
  },

  deleteActionIcon: {
    width: 44,
    height: 44,

    borderRadius: 13,

    backgroundColor: '#FEF2F2',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.md,
  },

  actionItemContent: {
    flex: 1,
  },

  actionItemTitle: {
    fontSize: 15,

    fontWeight: '700',

    color: colors.textPrimary,
  },

  deleteActionTitle: {
    fontSize: 15,

    fontWeight: '700',

    color: '#DC2626',
  },

  actionItemDescription: {
    marginTop: 3,

    fontSize: 12,
    lineHeight: 17,

    color: colors.textSecondary,
  },
});