import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import AppButton from '../../components/common/AppButton';
import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';
import {useAuth} from '../../hooks/useAuth';
import {MainStackParamList} from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<
  MainStackParamList,
  'Home'
>;

const HomeScreen = ({navigation}: Props) => {
  const {user, logout} = useAuth();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);

      await logout();

      /*
       * No manual navigation is required here.
       *
       * Firebase Authentication updates AuthContext,
       * and AppNavigator automatically switches from
       * MainNavigator to AuthNavigator.
       */
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

  const handleSubjects = () => {
    navigation.navigate('Subjects');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        LearnLoop AI
      </Text>

      <Text style={styles.tagline}>
        From Course Material to Targeted Revision
      </Text>

      <Text style={styles.welcome}>
        Welcome
        {user?.displayName
          ? `, ${user.displayName}`
          : ''}
        .
      </Text>

      <Text style={styles.email}>
        {user?.email}
      </Text>

      <Text style={styles.subtitle}>
        Organize your subjects, add learning materials,
        and turn them into smarter revision activities.
      </Text>

      <View style={styles.mainActionContainer}>
        <AppButton
          title="My Subjects"
          onPress={handleSubjects}
        />
      </View>

      <View style={styles.logoutContainer}>
        <AppButton
          title={
            loading
              ? 'Signing Out...'
              : 'Sign Out'
          }
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
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  tagline: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },

  welcome: {
    marginTop: spacing.xl,
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
    lineHeight: 23,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  mainActionContainer: {
    marginTop: spacing.xl,
  },

  logoutContainer: {
    marginTop: spacing.md,
  },
});

export default HomeScreen;