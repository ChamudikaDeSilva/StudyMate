import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  EllipsisVertical,
  FolderOpen,
} from 'lucide-react-native';

import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';

import {Subject} from '../../domain/models/Subject';

interface SubjectAccent {
  background: string;
  foreground: string;
}

interface SubjectCardProps {
  subject: Subject;

  accent: SubjectAccent;

  onPress?: () => void;

  onOptionsPress: (
    subject: Subject,
  ) => void;

  busy?: boolean;
}

const SubjectCard = ({
  subject,
  accent,
  onPress,
  onOptionsPress,
  busy = false,
}: SubjectCardProps) => {
  const getInitials = () => {
    const words = subject.name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return 'S';
    }

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return `${words[0][0]}${words[1][0]}`
      .toUpperCase();
  };

  const description =
    subject.description?.trim() ||
    'Organize your learning materials in this subject.';

  return (
    <Pressable
      disabled={!onPress || busy}
      accessibilityRole={
        onPress ? 'button' : undefined
      }
      accessibilityLabel={
        onPress
          ? `Open ${subject.name}`
          : undefined
      }
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        pressed &&
          !!onPress &&
          styles.cardPressed,
        busy && styles.busyCard,
      ]}>

      {/* Subject icon */}

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              accent.background,
          },
        ]}>

        <Text
          style={[
            styles.initials,
            {
              color:
                accent.foreground,
            },
          ]}>
          {getInitials()}
        </Text>

      </View>

      {/* Subject details */}

      <View style={styles.content}>

        <Text
          style={styles.name}
          numberOfLines={1}>
          {subject.name}
        </Text>

        <Text
          style={styles.description}
          numberOfLines={2}>
          {description}
        </Text>

        <View style={styles.typeRow}>
          <FolderOpen
            size={14}
            color={accent.foreground}
            strokeWidth={2}
          />

          <Text
            style={[
              styles.typeText,
              {
                color:
                  accent.foreground,
              },
            ]}>
            Learning subject
          </Text>
        </View>

      </View>

      {/* Options */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Options for ${subject.name}`}
        disabled={busy}
        hitSlop={10}
        onPress={event => {
          event.stopPropagation();

          onOptionsPress(subject);
        }}
        style={({pressed}) => [
          styles.optionsButton,
          pressed &&
            styles.optionsButtonPressed,
        ]}>

        <EllipsisVertical
          size={21}
          color={colors.textSecondary}
          strokeWidth={2}
        />

      </Pressable>

    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: colors.surface,

    borderRadius: 20,

    padding: spacing.md,

    marginBottom: spacing.md,

    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.04,

    shadowRadius: 8,

    elevation: 1,
  },

  cardPressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  busyCard: {
    opacity: 0.6,
  },

  iconContainer: {
    width: 58,
    height: 58,

    borderRadius: 17,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.md,
  },

  initials: {
    fontSize: 18,
    fontWeight: '800',
  },

  content: {
    flex: 1,
  },

  name: {
    fontSize: 16,

    fontWeight: '700',

    color: colors.textPrimary,
  },

  description: {
    marginTop: 4,

    fontSize: 12,
    lineHeight: 18,

    color: colors.textSecondary,
  },

  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,

    marginTop: 8,
  },

  typeText: {
    fontSize: 11,

    fontWeight: '600',
  },

  optionsButton: {
    width: 40,
    height: 40,

    marginLeft: spacing.sm,

    borderRadius: 12,

    backgroundColor:
      colors.surfaceSecondary,

    alignItems: 'center',
    justifyContent: 'center',
  },

  optionsButtonPressed: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.95,
      },
    ],
  },
});

export default SubjectCard;