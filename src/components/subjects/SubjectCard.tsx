import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ChevronRight,
  FolderOpen,
} from 'lucide-react-native';

import {Subject} from '../../domain/models/Subject';

import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';

interface SubjectAccent {
  background: string;
  foreground: string;
}

interface SubjectCardProps {
  subject: Subject;
  accent: SubjectAccent;
  onPress?: () => void;
}

const SubjectCard = ({
  subject,
  accent,
  onPress,
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

  const cardContent = (
    <>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: accent.background,
          },
        ]}>
        <Text
          style={[
            styles.initials,
            {
              color: accent.foreground,
            },
          ]}>
          {getInitials()}
        </Text>
      </View>

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
                color: accent.foreground,
              },
            ]}>
            Learning subject
          </Text>
        </View>
      </View>

      {onPress && (
        <View style={styles.arrowContainer}>
          <ChevronRight
            size={20}
            color={colors.textMuted}
            strokeWidth={2}
          />
        </View>
      )}
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.card}>
        {cardContent}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${subject.name}`}
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        pressed && styles.pressed,
      ]}>
      {cardContent}
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

  pressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.99,
      },
    ],
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

  arrowContainer: {
    width: 34,
    height: 34,

    marginLeft: spacing.sm,

    borderRadius: 17,

    backgroundColor: colors.surfaceSecondary,

    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SubjectCard;