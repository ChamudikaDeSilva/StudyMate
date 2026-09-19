import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {LucideIcon} from 'lucide-react-native';

import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';

interface HomeStatCardProps {
  value: string | number;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
}

const HomeStatCard = ({
  value,
  label,
  icon: Icon,
  iconColor,
  iconBackground,
}: HomeStatCardProps) => {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconContainer,
          {backgroundColor: iconBackground},
        ]}>
        <Icon
          size={20}
          color={iconColor}
          strokeWidth={2.2}
        />
      </View>

      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.label}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,

    minHeight: 120,

    backgroundColor: colors.surface,

    borderRadius: 18,

    padding: spacing.md,

    borderWidth: 1,
    borderColor: colors.border,
  },

  iconContainer: {
    width: 38,
    height: 38,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: spacing.md,
  },

  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  label: {
    marginTop: 3,

    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default HomeStatCard;