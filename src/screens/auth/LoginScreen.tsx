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

import {authStyles as styles} from './styles/authStyles';

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

      await login(email.trim(), password);

      /*
       * No manual navigation is required here.
       *
       * Firebase updates the authentication state.
       * AuthContext receives the authenticated user.
       * AppNavigator then switches from AuthNavigator
       * to MainNavigator automatically.
       */
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

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password recovery will be added later.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Brand */}
          <View style={styles.brandContainer}>
            <Image
              source={require('../../assets/images/learnloop-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.brandName}>
              LearnLoop AI
            </Text>
          </View>

          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.title}>
              Welcome back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue your learning.
            </Text>
          </View>

          {/* Login form */}
          <View style={styles.form}>
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
              error={passwordError}
            />

            <Pressable
              style={styles.forgotPasswordContainer}
              disabled={loading}
              onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>
                Forgot password?
              </Text>
            </Pressable>

            <AppButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
            />
          </View>

          {/* Registration */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?
            </Text>

            <Pressable
              disabled={loading}
              onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>
                Create account
              </Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;