import React, { useRef } from 'react';
import { Keyboard, Platform } from 'react-native';
import { ArrowRight, Mail } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import AppInput, { AppInputRef } from '../../components/common/AppInput';
import PasswordInput from '../../components/common/PasswordInput';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import AuthHero from '../../components/auth/AuthHero';
import AuthFormCard from '../../components/auth/AuthFormCard';
import AuthSwitchLink from '../../components/auth/AuthSwitchLink';
import { APP_NAME } from '../../constants/app';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { useAuthForm, validateEmail } from '../../hooks/useAuthForm';
import { AuthStackParamList } from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type LoginValues = { email: string; password: string };

const validateLogin = ({ email, password }: LoginValues) => ({
  email: validateEmail(email),
  password: password ? undefined : 'Enter your password.',
});

const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth();
  const emailRef = useRef<AppInputRef>(null);
  const passwordRef = useRef<AppInputRef>(null);
  const {
    values,
    errors,
    submitting,
    feedback,
    updateField,
    touchField,
    submit,
  } = useAuthForm<LoginValues>({ email: '', password: '' }, validateLogin);

  const handleLogin = () => {
    submit({
      onInvalid: field => {
        (field === 'email' ? emailRef : passwordRef).current?.focus();
      },
      onValid: async ({ email, password }) => {
        Keyboard.dismiss();
        await login(email.trim().toLowerCase(), password);
      },
      fallbackMessage: 'Unable to sign in. Please try again.',
    });
  };

  return (
    <AuthScreenLayout>
      <AuthHero variant="login" />

      <AuthFormCard
        title="Sign in"
        description="Your learning space is ready for you."
        submitting={submitting}
        feedback={feedback}
      >
        <AppInput
          ref={emailRef}
          label="Email address"
          accessibilityLabel="Email address"
          value={values.email}
          onChangeText={value => updateField('email', value)}
          onBlur={() => touchField('email')}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType={Platform.OS === 'ios' ? 'username' : undefined}
          editable={!submitting}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          leftIcon={<Mail size={19} color={colors.textSecondary} />}
        />

        <PasswordInput
          ref={passwordRef}
          label="Password"
          accessibilityLabel="Password"
          value={values.password}
          onChangeText={value => updateField('password', value)}
          onBlur={() => touchField('password')}
          error={errors.password}
          placeholder="Enter your password"
          editable={!submitting}
          returnKeyType="done"
          submitBehavior="submit"
          onSubmitEditing={handleLogin}
        />

        <AppButton
          title="Sign in"
          onPress={handleLogin}
          loading={submitting}
          disabled={submitting}
          icon={<ArrowRight size={19} color="#FFFFFF" />}
          className="mt-2"
        />
      </AuthFormCard>

      <AuthSwitchLink
        prompt={`New to ${APP_NAME}?`}
        title="Create account"
        disabled={submitting}
        onPress={() => navigation.navigate('Register')}
      />
    </AuthScreenLayout>
  );
};

export default LoginScreen;
