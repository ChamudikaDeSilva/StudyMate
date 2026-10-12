import React, { useRef } from 'react';
import { Text } from 'react-native';
import { LockKeyhole } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { ChangePasswordRequest } from '../../data/remote/api/authTypes';
import { AppInputRef } from '../common/AppInput';
import PasswordInput from '../common/PasswordInput';
import AccountFormModal from './AccountFormModal';
import useAccountForm from './useAccountForm';

interface ChangePasswordModalProps {
  onSave: (request: ChangePasswordRequest) => Promise<void>;
  onSaved: () => void;
  onClose: () => void;
}

const ChangePasswordModal = ({
  onSave,
  onSaved,
  onClose,
}: ChangePasswordModalProps) => {
  const currentRef = useRef<AppInputRef>(null);
  const newRef = useRef<AppInputRef>(null);
  const confirmRef = useRef<AppInputRef>(null);
  const form = useAccountForm(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    values => ({
      currentPassword: !values.currentPassword
        ? 'Enter your current password.'
        : values.currentPassword.length > 128
        ? 'Keep your current password within 128 characters.'
        : undefined,
      newPassword:
        values.newPassword.length < 8
          ? 'Use at least 8 characters for your new password.'
          : values.newPassword.length > 128
          ? 'Keep your new password within 128 characters.'
          : values.newPassword === values.currentPassword
          ? 'Choose a password different from your current one.'
          : undefined,
      confirmPassword:
        values.confirmPassword !== values.newPassword || !values.confirmPassword
          ? 'Your passwords do not match.'
          : undefined,
    }),
    {
      onSave: values =>
        onSave({
          current_password: values.currentPassword,
          new_password: values.newPassword,
        }),
      onSaved,
      onClose,
      onInvalid: field => {
        const refs = {
          currentPassword: currentRef,
          newPassword: newRef,
          confirmPassword: confirmRef,
        };
        refs[field].current?.focus();
      },
      fallbackMessage: 'Unable to change your password. Please try again.',
    },
  );

  return (
    <AccountFormModal
      title="Change password"
      subtitle="A fresh password for your learning space."
      icon={<LockKeyhole size={23} color={colors.primary} />}
      submitting={form.submitting}
      feedback={form.feedback}
      submitTitle="Update password"
      onSave={form.save}
      onClose={form.close}
    >
      <PasswordInput
        ref={currentRef}
        label="Current password"
        visibilityLabel="current password"
        value={form.values.currentPassword}
        onChangeText={value => form.updateField('currentPassword', value)}
        onBlur={() => form.touchField('currentPassword')}
        error={form.errors.currentPassword}
        editable={!form.submitting}
        autoFocus
        returnKeyType="next"
        onSubmitEditing={() => newRef.current?.focus()}
      />
      <PasswordInput
        ref={newRef}
        label="New password"
        visibilityLabel="new password"
        value={form.values.newPassword}
        onChangeText={value => form.updateField('newPassword', value)}
        onBlur={() => form.touchField('newPassword')}
        error={form.errors.newPassword}
        helperText="Use 8–128 characters, different from your current password."
        editable={!form.submitting}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <PasswordInput
        ref={confirmRef}
        label="Confirm new password"
        visibilityLabel="confirmation password"
        value={form.values.confirmPassword}
        onChangeText={value => form.updateField('confirmPassword', value)}
        onBlur={() => form.touchField('confirmPassword')}
        error={form.errors.confirmPassword}
        editable={!form.submitting}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={form.save}
      />
      <Text className="mb-4 text-xs leading-5 text-muted">
        You’ll stay signed in here. Updating your password signs out your other
        sessions.
      </Text>
    </AccountFormModal>
  );
};

export default ChangePasswordModal;
