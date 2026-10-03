import React, {useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

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
  const {login} = useAuth();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const handleLogin = async () => {
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (!normalizedEmail) {
      Alert.alert(
        'Email Required',
        'Please enter your email address.',
      );

      return;
    }


    if (!password) {
      Alert.alert(
        'Password Required',
        'Please enter your password.',
      );

      return;
    }


    try {
      setSubmitting(true);

      await login(
        normalizedEmail,
        password,
      );

      /*
       * Do not navigate manually.
       *
       * AuthContext updates the user.
       * AppNavigator automatically
       * switches from AuthNavigator
       * to MainNavigator.
       */

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : (
              'Unable to login. '
              + 'Please try again.'
            );

      Alert.alert(
        'Login Failed',
        message,
      );

    } finally {
      setSubmitting(false);
    }
  };


  return (
    <SafeAreaView
      className="flex-1 bg-slate-50">

      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }>

          <View
            className="
              flex-1
              px-6
              pb-8
              pt-8
            ">

            {/* =========================================
                BRAND
            ========================================= */}

            <View
              className="
                mb-10
                flex-row
                items-center
              ">

              <View
                className="
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-600
                ">

                <Sparkles
                  size={22}
                  color="#FFFFFF"
                  strokeWidth={2.3}
                />

              </View>


              <View className="ml-3">

                <Text
                  className="
                    text-xl
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
                  Learn smarter every day
                </Text>

              </View>

            </View>


            {/* =========================================
                HEADING
            ========================================= */}

            <View className="mb-7">

              <View
                className="
                  mb-4
                  self-start
                  rounded-full
                  bg-indigo-50
                  px-3
                  py-1.5
                ">

                <Text
                  className="
                    text-xs
                    font-bold
                    tracking-wider
                    text-indigo-600
                  ">
                  WELCOME BACK
                </Text>

              </View>


              <Text
                className="
                  text-4xl
                  font-bold
                  leading-[44px]
                  text-slate-950
                ">
                Continue your
                {'\n'}
                learning journey
              </Text>


              <Text
                className="
                  mt-3
                  text-base
                  leading-6
                  text-slate-500
                ">
                Sign in to access your
                subjects, study materials
                and AI learning tools.
              </Text>

            </View>


            {/* =========================================
                FORM CARD
            ========================================= */}

            <View
              className="
                rounded-[28px]
                border
                border-slate-200
                bg-white
                p-5
              ">

              {/* Email */}

              <Text
                className="
                  mb-2
                  text-sm
                  font-semibold
                  text-slate-700
                ">
                Email Address
              </Text>


              <View
                className="
                  mb-5
                  flex-row
                  items-center
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                ">

                <Mail
                  size={19}
                  color="#64748B"
                />


                <TextInput
                  className="
                    ml-3
                    flex-1
                    py-4
                    text-base
                    text-slate-900
                  "
                  value={email}
                  onChangeText={
                    setEmail
                  }
                  placeholder="you@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                  returnKeyType="next"
                />

              </View>


              {/* Password */}

              <Text
                className="
                  mb-2
                  text-sm
                  font-semibold
                  text-slate-700
                ">
                Password
              </Text>


              <View
                className="
                  flex-row
                  items-center
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                ">

                <LockKeyhole
                  size={19}
                  color="#64748B"
                />


                <TextInput
                  className="
                    ml-3
                    flex-1
                    py-4
                    text-base
                    text-slate-900
                  "
                  value={password}
                  onChangeText={
                    setPassword
                  }
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={
                    !showPassword
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                  returnKeyType="done"
                  onSubmitEditing={
                    handleLogin
                  }
                />


                <Pressable
                  onPress={() =>
                    setShowPassword(
                      current =>
                        !current,
                    )
                  }
                  hitSlop={10}>

                  {showPassword ? (
                    <EyeOff
                      size={20}
                      color="#64748B"
                    />
                  ) : (
                    <Eye
                      size={20}
                      color="#64748B"
                    />
                  )}

                </Pressable>

              </View>


              {/* Sign In */}

              <Pressable
                className="
                  mt-6
                  h-14
                  flex-row
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-600
                "
                disabled={submitting}
                onPress={handleLogin}
                style={({pressed}) => ({
                  opacity:
                    submitting
                      ? 0.6
                      : pressed
                        ? 0.85
                        : 1,
                })}>

                {submitting ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    className="
                      text-base
                      font-bold
                      text-white
                    ">
                    Sign In
                  </Text>
                )}

              </Pressable>

            </View>


            {/* =========================================
                REGISTER LINK
            ========================================= */}

            <View
              className="
                mt-7
                flex-row
                items-center
                justify-center
              ">

              <Text
                className="
                  text-sm
                  text-slate-500
                ">
                New to LearnLoop AI?
              </Text>


              <Pressable
                className="ml-1.5"
                disabled={submitting}
                onPress={() =>
                  navigation.navigate(
                    'Register',
                  )
                }>

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