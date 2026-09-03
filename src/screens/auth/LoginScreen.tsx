import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';
import {useAuth} from '../../hooks/useAuth';
import {AuthStackParamList} from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({navigation}: Props) => {
  const {login} = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;

    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      // No navigation call needed.
      // AuthContext updates the user,
      // then AppNavigator switches to MainNavigator.
    } catch (error: unknown) {
      console.error('Login error:', error);

      let message =
        'Unable to sign in. Please check your details and try again.';

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error
      ) {
        const firebaseError = error as {code?: string};

        switch (firebaseError.code) {
          case 'auth/invalid-email':
            message = 'The email address is invalid.';
            break;

          case 'auth/user-not-found':
            message = 'No account was found with this email address.';
            break;

          case 'auth/wrong-password':
            message = 'The password is incorrect.';
            break;

          case 'auth/invalid-credential':
            message = 'The email or password is incorrect.';
            break;

          case 'auth/too-many-requests':
            message =
              'Too many failed login attempts. Please try again later.';
            break;

          case 'auth/network-request-failed':
            message =
              'Network error. Check your internet connection and try again.';
            break;
        }
      }

      Alert.alert('Sign In Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <Text style={styles.title}>StudyMate</Text>

            <Text style={styles.subtitle}>
              Learn smarter with your AI study assistant.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>

            <Text style={styles.cardSubtitle}>
              Sign in to continue your learning.
            </Text>

            <AppInput
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={value => {
                setEmail(value);
                setEmailError('');
              }}
              error={emailError}
            />

            <AppInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={value => {
                setPassword(value);
                setPasswordError('');
              }}
              error={passwordError}
            />

            <AppButton
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              disabled={loading}
            />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>
                Don't have an account?
              </Text>

              <Pressable
                disabled={loading}
                onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Register</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  registerText: {
    color: colors.textSecondary,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default LoginScreen;