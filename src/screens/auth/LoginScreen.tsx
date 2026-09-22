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
  Sparkles,
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
    'Login'
  >;

const LoginScreen = ({
  navigation,
}: Props) => {
  const {login} =
    useAuth();

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
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
    loading,
    setLoading,
  ] = useState(false);

  // =========================================================
  // Validation
  // =========================================================

  const validateForm = () => {
    let isValid = true;

    setEmailError('');
    setPasswordError('');

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
    }

    return isValid;
  };

  // =========================================================
  // Login
  // =========================================================

  const handleLogin =
    async () => {
      if (!validateForm()) {
        return;
      }

      try {
        setLoading(true);

        await login(
          email.trim(),
          password,
        );
      } catch (
        error: unknown
      ) {
        console.error(
          'Login error:',
          error,
        );

        let message =
          'Unable to sign in. Please check your details and try again.';

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
            case 'auth/invalid-email':
              message =
                'The email address is invalid.';
              break;

            case 'auth/user-not-found':
              message =
                'No account was found with this email address.';
              break;

            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              message =
                'The email or password is incorrect.';
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

        Alert.alert(
          'Sign In Failed',
          message,
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================================================
  // Forgot password
  // =========================================================

  const handleForgotPassword =
    () => {
      Alert.alert(
        'Forgot Password',
        'Password recovery will be added later.',
      );
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
              min-h-full
              px-6
              pb-10
              pt-8
            ">

            {/* ==========================================
                BRAND
            =========================================== */}

            <View
              className="
                mb-12
                flex-row
                items-center
              ">

              <View
                className="
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                ">

                <Image
                  source={require(
                    '../../assets/images/learnloop-logo.png'
                  )}
                  className="
                    h-9
                    w-9
                  "
                  resizeMode="contain"
                />

              </View>

              <View className="ml-3">

                <Text
                  className="
                    text-base
                    font-bold
                    text-slate-900
                  ">
                  LearnLoop AI
                </Text>

                <Text
                  className="
                    mt-0.5
                    text-xs
                    text-slate-500
                  ">
                  Smarter learning,
                  one loop at a time
                </Text>

              </View>

            </View>

            {/* ==========================================
                WELCOME
            =========================================== */}

            <View className="mb-8">

              <View
                className="
                  mb-4
                  self-start
                  flex-row
                  items-center
                  rounded-full
                  bg-indigo-50
                  px-3
                  py-2
                ">

                <Sparkles
                  size={14}
                  color="#4F46E5"
                />

                <Text
                  className="
                    ml-2
                    text-[11px]
                    font-bold
                    tracking-wider
                    text-indigo-600
                  ">
                  WELCOME BACK
                </Text>

              </View>

              <Text
                className="
                  text-[32px]
                  font-bold
                  leading-[39px]
                  tracking-tight
                  text-slate-900
                ">
                Continue your
                learning journey.
              </Text>

              <Text
                className="
                  mt-3
                  max-w-[320px]
                  text-sm
                  leading-6
                  text-slate-500
                ">
                Sign in to access your
                subjects, materials and
                upcoming AI study tools.
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
                placeholder="Enter your password"
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

              <Pressable
                accessibilityRole="button"
                disabled={loading}
                onPress={
                  handleForgotPassword
                }
                className="
                  mb-6
                  self-end
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
                    font-semibold
                    text-indigo-600
                  ">
                  Forgot password?
                </Text>

              </Pressable>

              <AppButton
                title="Sign In"
                onPress={
                  handleLogin
                }
                loading={
                  loading
                }
              />

            </View>

            {/* ==========================================
                REGISTER
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
                Don't have an account?
              </Text>

              <Pressable
                accessibilityRole="button"
                disabled={loading}
                onPress={() =>
                  navigation.navigate(
                    'Register',
                  )
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
                  Create one
                </Text>

              </Pressable>

            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default LoginScreen;