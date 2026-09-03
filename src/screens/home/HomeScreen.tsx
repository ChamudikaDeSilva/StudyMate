import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>StudyMate</Text>

      <Text style={styles.subtitle}>
        Your AI study assistant is ready.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HomeScreen;