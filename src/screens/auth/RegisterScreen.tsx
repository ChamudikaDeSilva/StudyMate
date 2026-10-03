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
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
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

  const [password, setPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const handleRegister = async () => {
    const normalizedName =
      name.trim();

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (
      normalizedName.length < 2
    ) {
      Alert.alert(
        'Name Required',
        'Please enter your name.',
      );

      return;
    }


    if (!normalizedEmail) {
      Alert.alert(
        'Email Required',
        'Please enter your email address.',
      );

      return;
    }


    if (password.length < 8) {
      Alert.alert(
        'Password Too Short',
        'Your password must contain at least 8 characters.',
      );

      return;
    }


    if (
      password !==
      confirmPassword
    ) {
      Alert.alert(
        'Passwords Do Not Match',
        'Please make sure both passwords are the same.',
      );

      return;
    }


    try {
      setSubmitting(true);


      await register(
        normalizedName,
        normalizedEmail,
        password,
      );


      /*
       * register() creates the account
       * and automatically logs the user in.
       *
       * AuthContext updates the user.
       * AppNavigator then switches
       * automatically to MainNavigator.
       *
       * No manual navigation is required.
       */

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : (
              'Unable to create your '
              + 'account. Please try again.'
            );


      Alert.alert(
        'Registration Failed',
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
              pt-6
            ">

            {/* =========================================
                TOP BAR
            ========================================= */}

            <View
              className="
                mb-8
                flex-row
                items-center
                justify-between
              ">

              <Pressable
                className="
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                "
                disabled={submitting}
                onPress={() =>
                  navigation.goBack()
                }
                style={({pressed}) => ({
                  opacity:
                    pressed
                      ? 0.65
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

                <View
                  className="
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-indigo-600
                  ">

                  <Sparkles
                    size={18}
                    color="#FFFFFF"
                  />

                </View>


                <Text
                  className="
                    ml-2
                    text-base
                    font-bold
                    text-slate-900
                  ">
                  LearnLoop AI
                </Text>

              </View>

            </View>


            {/* =========================================
                HEADING
            ========================================= */}

            <View className="mb-7">

              <Text
                className="
                  text-4xl
                  font-bold
                  leading-[44px]
                  text-slate-950
                ">
                Create your
                {'\n'}
                learning space
              </Text>


              <Text
                className="
                  mt-3
                  text-base
                  leading-6
                  text-slate-500
                ">
                Create an account to
                organize subjects and turn
                your study materials into
                smarter learning resources.
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

              {/* Name */}

              <Text
                className="
                  mb-2
                  text-sm
                  font-semibold
                  text-slate-700
                ">
                Full Name
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

                <UserRound
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
                  value={name}
                  onChangeText={
                    setName
                  }
                  placeholder="Your full name"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!submitting}
                  returnKeyType="next"
                />

              </View>


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
                  mb-2
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
                  placeholder="Minimum 8 characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={
                    !showPassword
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                  returnKeyType="next"
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


              <Text
                className="
                  mb-5
                  text-xs
                  text-slate-400
                ">
                Use at least 8 characters.
              </Text>


              {/* Confirm Password */}

              <Text
                className="
                  mb-2
                  text-sm
                  font-semibold
                  text-slate-700
                ">
                Confirm Password
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
                  value={
                    confirmPassword
                  }
                  onChangeText={
                    setConfirmPassword
                  }
                  placeholder="Re-enter password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={
                    !showConfirmPassword
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                  returnKeyType="done"
                  onSubmitEditing={
                    handleRegister
                  }
                />


                <Pressable
                  onPress={() =>
                    setShowConfirmPassword(
                      current =>
                        !current,
                    )
                  }
                  hitSlop={10}>

                  {showConfirmPassword ? (
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


              {/* Create Account */}

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
                onPress={handleRegister}
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
                    Create Account
                  </Text>
                )}

              </Pressable>

            </View>


            {/* =========================================
                LOGIN LINK
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
                Already have an account?
              </Text>


              <Pressable
                className="ml-1.5"
                disabled={submitting}
                onPress={() =>
                  navigation.goBack()
                }>

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