import React, { useRef } from 'react';
import { Keyboard, Platform } from 'react-native';
import { ArrowRight, Mail, UserRound } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import AppInput, { AppInputRef } from '../../components/common/AppInput';
import PasswordInput from '../../components/common/PasswordInput';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import AuthHero from '../../components/auth/AuthHero';
import AuthFormCard from '../../components/auth/AuthFormCard';
import AuthSwitchLink from '../../components/auth/AuthSwitchLink';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { useAuthForm, validateEmail } from '../../hooks/useAuthForm';
import { AuthStackParamList } from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
type RegisterValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const validateRegister = ({
  name,
  email,
  password,
  confirmPassword,
}: RegisterValues) => ({
  name:
    name.trim().length >= 2
      ? undefined
      : 'Enter a name with at least 2 characters.',
  email: validateEmail(email),
  password: password.length >= 8 ? undefined : 'Use at least 8 characters.',
  confirmPassword: !confirmPassword
    ? 'Confirm your password.'
    : password !== confirmPassword
    ? 'Passwords do not match.'
    : undefined,
});

const RegisterScreen = ({ navigation }: Props) => {
  const { register } = useAuth();
  const nameRef = useRef<AppInputRef>(null);
  const emailRef = useRef<AppInputRef>(null);
  const passwordRef = useRef<AppInputRef>(null);
  const confirmPasswordRef = useRef<AppInputRef>(null);
  const {
    values,
    errors,
    submitting,
    feedback,
    updateField,
    touchField,
    submit,
  } = useAuthForm<RegisterValues>(
    { name: '', email: '', password: '', confirmPassword: '' },
    validateRegister,
  );

  const returnToLogin = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  const handleRegister = () => {
    submit({
      onInvalid: field => {
        const inputRefs = {
          name: nameRef,
          email: emailRef,
          password: passwordRef,
          confirmPassword: confirmPasswordRef,
        };
        inputRefs[field].current?.focus();
      },
      onValid: async ({ name, email, password }) => {
        Keyboard.dismiss();
        await register(name.trim(), email.trim().toLowerCase(), password);
      },
      fallbackMessage: 'Unable to create your account. Please try again.',
    });
  };

  return (
    <AuthScreenLayout onBack={returnToLogin} backDisabled={submitting}>
      <AuthHero variant="register" />

      <AuthFormCard
        title="Create account"
        description="Keep your notes and study tools together."
        submitting={submitting}
        feedback={feedback}
      >
        <AppInput
          ref={nameRef}
          label="Full name"
          accessibilityLabel="Full name"
          value={values.name}
          onChangeText={value => updateField('name', value)}
          onBlur={() => touchField('name')}
          error={errors.name}
          placeholder="Your full name"
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="name"
          textContentType={Platform.OS === 'ios' ? 'name' : undefined}
          editable={!submitting}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
          leftIcon={<UserRound size={19} color={colors.textSecondary} />}
        />

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
          placeholder="Create a password"
          autoComplete="new-password"
          textContentType={Platform.OS === 'ios' ? 'newPassword' : undefined}
          editable={!submitting}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          helperText={
            values.password.length >= 8
              ? '✓ At least 8 characters — ready to use.'
              : 'Use at least 8 characters.'
          }
        />

        <PasswordInput
          ref={confirmPasswordRef}
          visibilityLabel="confirmation password"
          label="Confirm password"
          accessibilityLabel="Confirm password"
          value={values.confirmPassword}
          onChangeText={value => updateField('confirmPassword', value)}
          onBlur={() => touchField('confirmPassword')}
          error={errors.confirmPassword}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          textContentType={Platform.OS === 'ios' ? 'newPassword' : undefined}
          editable={!submitting}
          returnKeyType="done"
          submitBehavior="submit"
          onSubmitEditing={handleRegister}
          helperText={
            values.confirmPassword && values.confirmPassword === values.password
              ? '✓ Passwords match.'
              : undefined
          }
        />

        <AppButton
          title="Create account"
          onPress={handleRegister}
          loading={submitting}
          disabled={submitting}
          icon={<ArrowRight size={19} color="#FFFFFF" />}
          className="mt-2"
        />
      </AuthFormCard>

      <AuthSwitchLink
        prompt="Already have an account?"
        title="Sign in"
        disabled={submitting}
        onPress={returnToLogin}
      />
    </AuthScreenLayout>
  );
};

export default RegisterScreen;
