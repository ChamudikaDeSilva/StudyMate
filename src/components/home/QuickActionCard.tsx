import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ChevronRight,
  LucideIcon,
} from 'lucide-react-native';

import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;

  iconColor: string;
  iconBackground: string;

  onPress?: () => void;

  disabled?: boolean;
}

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBackground,
  onPress,
  disabled = false,
}: QuickActionCardProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>

      <View
        style={[
          styles.iconContainer,
          {backgroundColor: iconBackground},
        ]}>
        <Icon
          size={22}
          color={iconColor}
          strokeWidth={2.2}
        />
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {title}
          </Text>

          <Text
            style={styles.description}
            numberOfLines={2}>
            {description}
          </Text>
        </View>

        {!disabled && (
          <ChevronRight
            size={18}
            color={colors.textMuted}
          />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',

    minHeight: 145,

    backgroundColor: colors.surface,

    borderRadius: 18,

    padding: spacing.md,

    borderWidth: 1,
    borderColor: colors.border,

    justifyContent: 'space-between',
  },

  disabled: {
    opacity: 0.55,
  },

  pressed: {
    opacity: 0.82,
    transform: [{scale: 0.98}],
  },

  iconContainer: {
    width: 44,
    height: 44,

    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  textContainer: {
    flex: 1,
    paddingRight: spacing.xs,
  },

  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  description: {
    marginTop: spacing.xs,

    fontSize: 12,
    lineHeight: 17,

    color: colors.textSecondary,
  },
});

export default QuickActionCard;