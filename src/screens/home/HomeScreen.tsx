import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppButton from '../../components/common/AppButton';
import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';
import {useAuth} from '../../hooks/useAuth';

const HomeScreen = () => {
  const {user, logout} = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();

      // AppNavigator will automatically
      // switch back to AuthNavigator.
    } catch (error) {
      console.error('Logout error:', error);

      Alert.alert(
        'Logout Failed',
        'Unable to sign out. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>StudyMate</Text>

      <Text style={styles.welcome}>
        Welcome{user?.displayName ? `, ${user.displayName}` : ''}.
      </Text>

      <Text style={styles.email}>
        {user?.email}
      </Text>

      <Text style={styles.subtitle}>
        Your AI study assistant is ready.
      </Text>

      <View style={styles.buttonContainer}>
        <AppButton
          title={loading ? 'Signing Out...' : 'Sign Out'}
          onPress={handleLogout}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  welcome: {
    marginTop: spacing.lg,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  email: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
});

export default HomeScreen;