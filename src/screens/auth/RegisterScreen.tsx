import React, {
  useState,
} from 'react';

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  ArrowLeft,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';

import {useAuth} from '../../hooks/useAuth';

import {
  AuthStackParamList,
} from '../../navigation/navigationTypes';

type Props =
  NativeStackScreenProps<
    AuthStackParamList,
    'Register'
  >;

const RegisterScreen = ({
  navigation,
}: Props) => {
  const {register} =
    useAuth();

  const [
    name,
    setName,
  ] = useState('');

  const [
    email,
    setEmail,
  ] = useState('');

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
    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

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
              px-6
              pb-10
              pt-6
            ">

            {/* ==========================================
                TOP BAR
            =========================================== */}

            <View
              className="
                mb-10
                flex-row
                items-center
                justify-between
              ">

              <Pressable
                accessibilityRole="button"
                disabled={loading}
                onPress={() =>
                  navigation.goBack()
                }
                className="
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                "
                style={({
                  pressed,
                }) => ({
                  opacity:
                    loading
                      ? 0.5
                      : pressed
                        ? 0.7
                        : 1,
                })}>

                <ArrowLeft
                  size={21}
                  color="#0F172A"
                />

              </Pressable>

              <View
                className="
                  flex-row
                  items-center
                ">

                <Image
                  source={require(
                    '../../assets/images/learnloop-logo.png'
                  )}
                  className="
                    h-8
                    w-8
                  "
                  resizeMode="contain"
                />

                <Text
                  className="
                    ml-2
                    text-sm
                    font-bold
                    text-slate-900
                  ">
                  LearnLoop AI
                </Text>

              </View>

            </View>

            {/* ==========================================
                HEADING
            =========================================== */}

            <View className="mb-8">

              <Text
                className="
                  text-[30px]
                  font-bold
                  leading-[37px]
                  tracking-tight
                  text-slate-900
                ">
                Create your account
              </Text>

              <Text
                className="
                  mt-3
                  max-w-[320px]
                  text-sm
                  leading-6
                  text-slate-500
                ">
                Set up your LearnLoop
                workspace and start
                organizing your study
                materials.
              </Text>

            </View>

            {/* ==========================================
                FORM
            =========================================== */}

            <View
              className="
                rounded-[26px]
                border
                border-slate-200
                bg-white
                p-6
              ">

              <AppInput
                label="Your name"
                placeholder="Enter your name"
                value={name}
                onChangeText={value => {
                  setName(value);

                  setNameError('');
                }}
                error={
                  nameError
                }
              />

              <AppInput
                label="Email address"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={value => {
                  setEmail(value);

                  setEmailError('');
                }}
                error={
                  emailError
                }
              />

              <AppInput
                label="Password"
                placeholder="Minimum 6 characters"
                secureTextEntry
                value={
                  password
                }
                onChangeText={value => {
                  setPassword(
                    value,
                  );

                  setPasswordError(
                    '',
                  );
                }}
                error={
                  passwordError
                }
              />

              <AppInput
                label="Confirm password"
                placeholder="Enter password again"
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
                disabled={
                  loading
                }
              />

            </View>

            {/* ==========================================
                SIGN IN
            =========================================== */}

            <View
              className="
                mt-8
                flex-row
                items-center
                justify-center
              ">

              <Text
                className="
                  text-sm
                  text-slate-500
                ">
                Already have an account?
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
                "
                style={({
                  pressed,
                }) => ({
                  opacity:
                    loading
                      ? 0.5
                      : pressed
                        ? 0.65
                        : 1,
                })}>

                <Text
                  className="
                    text-sm
                    font-bold
                    text-indigo-600
                  ">
                  Sign in
                </Text>

              </Pressable>

            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default RegisterScreen;