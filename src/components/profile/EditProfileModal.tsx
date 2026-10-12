import React, { useRef } from 'react';
import { Text, View } from 'react-native';
import { Mail, Pencil, UserRound } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { UpdateProfileRequest } from '../../data/remote/api/authTypes';
import { validateEmail } from '../../hooks/useAuthForm';
import AppInput, { AppInputRef } from '../common/AppInput';
import PasswordInput from '../common/PasswordInput';
import AccountFormModal from './AccountFormModal';
import useAccountForm from './useAccountForm';

interface EditProfileModalProps {
  initialName: string;
  initialEmail: string;
  onSave: (request: UpdateProfileRequest) => Promise<void>;
  onSaved: (emailChanged: boolean) => void;
  onClose: () => void;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const EditProfileModal = ({
  initialName,
  initialEmail,
  onSave,
  onSaved,
  onClose,
}: EditProfileModalProps) => {
  const nameRef = useRef<AppInputRef>(null);
  const emailRef = useRef<AppInputRef>(null);
  const passwordRef = useRef<AppInputRef>(null);
  const originalEmail = normalizeEmail(initialEmail);
  const form = useAccountForm(
    { name: initialName, email: initialEmail, currentPassword: '' },
    values => ({
      name:
        values.name.trim().length < 2
          ? 'Your name needs at least 2 characters.'
          : values.name.trim().length > 100
          ? 'Keep your name within 100 characters.'
          : undefined,
      email: validateEmail(values.email),
      currentPassword:
        normalizeEmail(values.email) === originalEmail
          ? undefined
          : !values.currentPassword
          ? 'Enter your current password to change your email.'
          : values.currentPassword.length > 128
          ? 'Keep your current password within 128 characters.'
          : undefined,
    }),
    {
      onSave: values => {
        const email = normalizeEmail(values.email);
        return onSave({
          name: values.name.trim(),
          email,
          ...(email !== originalEmail
            ? { current_password: values.currentPassword }
            : {}),
        });
      },
      onSaved: values =>
        onSaved(normalizeEmail(values.email) !== originalEmail),
      onClose,
      onInvalid: field => {
        const refs = {
          name: nameRef,
          email: emailRef,
          currentPassword: passwordRef,
        };
        refs[field].current?.focus();
      },
      fallbackMessage: 'Unable to update your profile. Please try again.',
    },
  );
  const emailChanged = normalizeEmail(form.values.email) !== originalEmail;

  return (
    <AccountFormModal
      title="Edit profile"
      subtitle="Keep your details up to date."
      icon={<Pencil size={23} color={colors.primary} />}
      submitting={form.submitting}
      feedback={form.feedback}
      submitTitle="Save changes"
      onSave={form.save}
      onClose={form.close}
    >
      <AppInput
        ref={nameRef}
        label="Full name"
        value={form.values.name}
        onChangeText={value => form.updateField('name', value)}
        onBlur={() => form.touchField('name')}
        error={form.errors.name}
        editable={!form.submitting}
        autoFocus
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        maxLength={100}
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        leftIcon={<UserRound size={19} color={colors.textSecondary} />}
      />
      <AppInput
        ref={emailRef}
        label="Email address"
        value={form.values.email}
        onChangeText={value => form.updateField('email', value)}
        onBlur={() => form.touchField('email')}
        error={form.errors.email}
        helperText="This is the address you use to sign in."
        editable={!form.submitting}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        maxLength={254}
        returnKeyType={emailChanged ? 'next' : 'done'}
        onSubmitEditing={() =>
          emailChanged ? passwordRef.current?.focus() : form.save()
        }
        leftIcon={<Mail size={19} color={colors.textSecondary} />}
      />
      {emailChanged && (
        <>
          <View className="mb-5 rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <Text className="text-sm font-semibold text-brand-700">
              Your sign-in address will change
            </Text>
            <Text className="mt-1.5 text-sm leading-5 text-muted">
              Double-check the new address before saving. Your current password
              confirms this change and signs out your other sessions.
            </Text>
          </View>
          <PasswordInput
            ref={passwordRef}
            label="Current password"
            visibilityLabel="current password"
            value={form.values.currentPassword}
            onChangeText={value => form.updateField('currentPassword', value)}
            onBlur={() => form.touchField('currentPassword')}
            error={form.errors.currentPassword}
            editable={!form.submitting}
            returnKeyType="done"
            onSubmitEditing={form.save}
          />
        </>
      )}
    </AccountFormModal>
  );
};

export default EditProfileModal;
