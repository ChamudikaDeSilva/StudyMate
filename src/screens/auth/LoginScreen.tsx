import React, {useState} from 'react';

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

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';

import {useAuth} from '../../hooks/useAuth';

import {AuthStackParamList} from '../../navigation/navigationTypes';

type Props =
  NativeStackScreenProps<
    AuthStackParamList,
    'Login'
  >;

const LoginScreen = ({
  navigation,
}: Props) => {
  const {login} = useAuth();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [emailError, setEmailError] =
    useState('');

  const [
    passwordError,
    setPasswordError,
  ] = useState('');

  const [loading, setLoading] =
    useState(false);

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

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await login(
        email.trim(),
        password,
      );

      /*
       * No manual navigation is required.
       *
       * Firebase updates authentication state.
       * AuthContext receives the authenticated user.
       * AppNavigator switches automatically.
       */
    } catch (error: unknown) {
      console.error(
        'Login error:',
        error,
      );

      let message =
        'Unable to sign in. Please check your details and try again.';

      if (
        typeof error === 'object' &&
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

          <View className="flex-1 justify-center px-6 py-10">

            {/* ==============================================
                BRAND
            =============================================== */}

            <View className="mb-7 items-start">

              <Image
                source={require(
                  '../../assets/images/learnloop-logo.png'
                )}
                className="mb-2 h-14 w-20"
                resizeMode="contain"
              />

              <Text
                className="
                  text-base
                  font-bold
                  tracking-wide
                  text-slate-900
                ">
                LearnLoop AI
              </Text>

            </View>

            {/* ==============================================
                HEADING
            =============================================== */}

            <View className="mb-7">

              <Text
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-slate-900
                ">
                Welcome back
              </Text>

              <Text
                className="
                  mt-2
                  text-base
                  leading-6
                  text-slate-500
                ">
                Sign in to continue your
                learning.
              </Text>

            </View>

            {/* ==============================================
                FORM
            =============================================== */}

            <View className="w-full">

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
                placeholder="Enter your password"
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

              <Pressable
                accessibilityRole="button"
                disabled={loading}
                onPress={
                  handleForgotPassword
                }
                className="
                  -mt-1
                  mb-6
                  self-end
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
                  Forgot password?
                </Text>

              </Pressable>

              <AppButton
                title="Sign In"
                onPress={
                  handleLogin
                }
                loading={loading}
              />

            </View>

            {/* ==============================================
                REGISTRATION
            =============================================== */}

            <View
              className="
                mt-7
                flex-row
                items-center
                justify-center
              ">

              <Text className="text-sm text-slate-500">
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
                  active:opacity-60
                  disabled:opacity-50
                ">

                <Text
                  className="
                    text-sm
                    font-bold
                    text-indigo-600
                  ">
                  Create account
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