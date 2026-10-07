import React, {useState} from 'react';
import {Alert, Pressable, Text, View} from 'react-native';
import {Eye, EyeOff, LockKeyhole, Mail, UserRound} from 'lucide-react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import {useAuth} from '../../hooks/useAuth';
import {AuthStackParamList} from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen = ({navigation}: Props) => {
  const {register} = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }
    if (!normalizedEmail) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password Too Short', 'Your password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords Do Not Match', 'Please make sure both passwords are the same.');
      return;
    }

    try {
      setSubmitting(true);
      await register(normalizedName, normalizedEmail, password);
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error instanceof Error
          ? error.message
          : 'Unable to create your account. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const passwordToggle = (
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
  ) => (
    <Pressable onPress={() => setVisible(current => !current)} hitSlop={10}>
      {visible ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
    </Pressable>
  );

  return (
    <AuthScreenLayout onBack={() => navigation.goBack()}>
      <View className="mb-7">
        <Text className="text-4xl font-bold leading-[44px] text-slate-950">
          Create your{`\n`}learning space
        </Text>
        <Text className="mt-3 text-base leading-6 text-slate-500">
          Create an account to organize subjects and turn your study materials into smarter
          learning resources.
        </Text>
      </View>

      <View className="rounded-[28px] border border-slate-200 bg-white p-5">
        <AppInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!submitting}
          leftIcon={<UserRound size={19} color="#64748B" />}
        />

        <AppInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting}
          leftIcon={<Mail size={19} color="#64748B" />}
        />

        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Minimum 8 characters"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting}
          helperText="Use at least 8 characters."
          leftIcon={<LockKeyhole size={19} color="#64748B" />}
          rightAccessory={passwordToggle(showPassword, setShowPassword)}
        />

        <AppInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting}
          returnKeyType="done"
          onSubmitEditing={handleRegister}
          leftIcon={<LockKeyhole size={19} color="#64748B" />}
          rightAccessory={passwordToggle(showConfirmPassword, setShowConfirmPassword)}
        />

        <AppButton
          title="Create Account"
          onPress={handleRegister}
          loading={submitting}
          className="mt-2"
        />
      </View>

      <View className="mt-7 flex-row items-center justify-center">
        <Text className="text-sm text-slate-500">Already have an account?</Text>
        <Pressable className="ml-1.5" disabled={submitting} onPress={() => navigation.goBack()}>
          <Text className="text-sm font-bold text-indigo-600">Sign in</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
};

export default RegisterScreen;
