import React, {useState} from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';

import {useAuth} from '../../hooks/useAuth';

import {AuthStackParamList} from '../../navigation/navigationTypes';

type Props =
  NativeStackScreenProps<
    AuthStackParamList,
    'Register'
  >;

const RegisterScreen = ({
  navigation,
}: Props) => {
  const {register} = useAuth();

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    nameError,
    setNameError,
  ] = useState('');

  const [
    emailError,
    setEmailError,
  ] = useState('');

  const [
    passwordError,
    setPasswordError,
  ] = useState('');

  const [
    confirmPasswordError,
    setConfirmPasswordError,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  // =========================================================
  // Validation
  // =========================================================

  const validateForm = () => {
    let isValid = true;

    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!name.trim()) {
      setNameError(
        'Name is required.',
      );

      isValid = false;
    }

    if (!email.trim()) {
      setEmailError(
        'Email is required.',
      );

      isValid = false;
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        email.trim(),
      )
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
    } else if (
      password.length < 6
    ) {
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
      password !==
      confirmPassword
    ) {
      setConfirmPasswordError(
        'Passwords do not match.',
      );

      isValid = false;
    }

    return isValid;
  };

  // =========================================================
  // Register
  // =========================================================

  const handleRegister =
    async () => {
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

        /*
         * No manual navigation is required.
         *
         * Firebase updates authentication state.
         * AuthContext receives the logged-in user.
         * AppNavigator switches to MainNavigator.
         */
      } catch (
        error: unknown
      ) {
        console.error(
          'Registration error:',
          error,
        );

        let message =
          'Unable to create your account. Please try again.';

        if (
          typeof error ===
            'object' &&
          error !== null &&
          'code' in error
        ) {
          const firebaseError =
            error as {
              code?: string;
            };

          switch (
            firebaseError.code
          ) {
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

  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView className="flex-1 bg-slate-50">

      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }>

          <View
            className="
              flex-1
              justify-center
              px-6
              py-10
            ">

            {/* ==============================================
                HEADER
            =============================================== */}

            <View className="mb-7">

              <Text
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-slate-900
                ">
                Create your account
              </Text>

              <Text
                className="
                  mt-2
                  text-base
                  leading-6
                  text-slate-500
                ">
                Start building your
                personal study space.
              </Text>

            </View>

            {/* ==============================================
                FORM CARD
            =============================================== */}

            <View
              className="
                rounded-3xl
                border
                border-slate-100
                bg-white
                p-6
              ">

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
                autoCorrect={false}
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
                error={
                  passwordError
                }
              />

              <AppInput
                label="Confirm Password"
                placeholder="Confirm your password"
                secureTextEntry
                value={
                  confirmPassword
                }
                onChangeText={value => {
                  setConfirmPassword(
                    value,
                  );

                  setConfirmPasswordError(
                    '',
                  );
                }}
                error={
                  confirmPasswordError
                }
              />

              <AppButton
                title={
                  loading
                    ? 'Creating Account...'
                    : 'Create Account'
                }
                onPress={
                  handleRegister
                }
                disabled={loading}
              />

              {/* ============================================
                  SIGN IN LINK
              ============================================= */}

              <View
                className="
                  mt-6
                  flex-row
                  items-center
                  justify-center
                ">

                <Text className="text-sm text-slate-500">
                  Already have an
                  account?
                </Text>

                <Pressable
                  accessibilityRole="button"
                  disabled={loading}
                  onPress={() =>
                    navigation.goBack()
                  }
                  className="
                    ml-1
                    py-1
                    active:opacity-60
                    disabled:opacity-50
                  ">

                  <Text
                    className="
                      text-sm
                      font-semibold
                      text-indigo-600
                    ">
                    Sign In
                  </Text>

                </Pressable>

              </View>

            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default RegisterScreen;