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

type Props =
  NativeStackScreenProps<
    AuthStackParamList,
    'Register'
  >;

const RegisterScreen = ({navigation}: Props) => {
  const {register} = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [nameError, setNameError] =
    useState('');
  const [emailError, setEmailError] =
    useState('');
  const [passwordError, setPasswordError] =
    useState('');
  const [
    confirmPasswordError,
    setConfirmPasswordError,
  ] = useState('');

  const [loading, setLoading] =
    useState(false);

  const validateForm = () => {
    let isValid = true;

    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!name.trim()) {
      setNameError('Name is required.');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (
      !/^\S+@\S+\.\S+$/.test(email.trim())
    ) {
      setEmailError(
        'Enter a valid email address.',
      );
      isValid = false;
    }

    if (!password) {
      setPasswordError(
        'Password is required.',
      );
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(
        'Password must contain at least 6 characters.',
      );
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(
        'Please confirm your password.',
      );
      isValid = false;
    } else if (
      password !== confirmPassword
    ) {
      setConfirmPasswordError(
        'Passwords do not match.',
      );
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await register(
        name,
        email,
        password,
      );

      // No navigation call is needed here.
      // AuthContext detects the logged-in user
      // and AppNavigator switches to MainNavigator.
    } catch (error: unknown) {
      console.error(
        'Registration error:',
        error,
      );

      let message =
        'Unable to create your account. Please try again.';

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error
      ) {
        const firebaseError =
          error as {code?: string};

        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            message =
              'An account already exists with this email address.';
            break;

          case 'auth/invalid-email':
            message =
              'The email address is invalid.';
            break;

          case 'auth/weak-password':
            message =
              'Please choose a stronger password.';
            break;

          case 'auth/network-request-failed':
            message =
              'Network error. Check your internet connection and try again.';
            break;
        }
      }

      Alert.alert(
        'Registration Failed',
        message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>
              Create your account
            </Text>

            <Text style={styles.subtitle}>
              Start building your personal study space.
            </Text>
          </View>

          <View style={styles.card}>
            <AppInput
              label="Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={value => {
                setName(value);
                setNameError('');
              }}
              error={nameError}
            />

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
              placeholder="Create a password"
              secureTextEntry
              value={password}
              onChangeText={value => {
                setPassword(value);
                setPasswordError('');
              }}
              error={passwordError}
            />

            <AppInput
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={value => {
                setConfirmPassword(value);
                setConfirmPasswordError('');
              }}
              error={confirmPasswordError}
            />

            <AppButton
              title={
                loading
                  ? 'Creating Account...'
                  : 'Create Account'
              }
              onPress={handleRegister}
              disabled={loading}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>
                Already have an account?
              </Text>

              <Pressable
                disabled={loading}
                onPress={() =>
                  navigation.goBack()
                }>
                <Text style={styles.loginLink}>
                  Sign In
                </Text>
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
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    color: colors.textSecondary,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default RegisterScreen;