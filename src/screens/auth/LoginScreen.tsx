import React, {useState} from 'react';
import {Alert, Pressable, Text, View} from 'react-native';
import {Eye, EyeOff, LockKeyhole, Mail} from 'lucide-react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import {useAuth} from '../../hooks/useAuth';
import {AuthStackParamList} from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({navigation}: Props) => {
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }

    if (!password) {
      Alert.alert('Password Required', 'Please enter your password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(normalizedEmail, password);
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Unable to login. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout>
      <View className="mb-7">
        <View className="mb-4 self-start rounded-full bg-indigo-50 px-3 py-1.5">
          <Text className="text-xs font-bold tracking-wider text-indigo-600">
            WELCOME BACK
          </Text>
        </View>

        <Text className="text-4xl font-bold leading-[44px] text-slate-950">
          Continue your{`\n`}learning journey
        </Text>
        <Text className="mt-3 text-base leading-6 text-slate-500">
          Sign in to access your subjects, study materials and AI learning tools.
        </Text>
      </View>

      <View className="rounded-[28px] border border-slate-200 bg-white p-5">
        <AppInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting}
          returnKeyType="next"
          leftIcon={<Mail size={19} color="#64748B" />}
        />

        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          leftIcon={<LockKeyhole size={19} color="#64748B" />}
          rightAccessory={
            <Pressable onPress={() => setShowPassword(current => !current)} hitSlop={10}>
              {showPassword ? (
                <EyeOff size={20} color="#64748B" />
              ) : (
                <Eye size={20} color="#64748B" />
              )}
            </Pressable>
          }
        />

        <AppButton title="Sign In" onPress={handleLogin} loading={submitting} className="mt-2" />
      </View>

      <View className="mt-7 flex-row items-center justify-center">
        <Text className="text-sm text-slate-500">New to LearnLoop AI?</Text>
        <Pressable
          className="ml-1.5"
          disabled={submitting}
          onPress={() => navigation.navigate('Register')}>
          <Text className="text-sm font-bold text-indigo-600">Create account</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
};

export default LoginScreen;
