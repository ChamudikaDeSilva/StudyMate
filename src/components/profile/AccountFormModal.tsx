import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import AuthFeedback from '../auth/AuthFeedback';
import AppModal from '../common/AppModal';
import AppButton from '../common/AppButton';
import ScreenHeader from '../common/ScreenHeader';
import SectionCard from '../common/SectionCard';

interface AccountFormModalProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
  submitting: boolean;
  feedback: string;
  submitTitle: string;
  onSave: () => void;
  onClose: () => void;
}

const AccountFormModal = ({
  title,
  subtitle,
  icon,
  children,
  submitting,
  feedback,
  submitTitle,
  onSave,
  onClose,
}: AccountFormModalProps) => (
  <AppModal
    visible
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onClose}
  >
    <KeyboardAvoidingView
      className="flex-1 bg-ink/50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView
        edges={['top', 'bottom', 'left', 'right']}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-5 py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Pressable
            accessible={false}
            disabled={submitting}
            className="flex-grow justify-center"
            onPress={onClose}
          >
            <Pressable
              accessible={false}
              className="w-full max-w-[520px] self-center"
              onPress={event => event.stopPropagation()}
            >
              <SectionCard accessibilityViewIsModal>
                <View className="mb-5 flex-row items-center justify-between">
                  <View className="h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-brand-50">
                    {icon}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Close ${title.toLowerCase()}`}
                    accessibilityState={{ disabled: submitting }}
                    disabled={submitting}
                    onPress={onClose}
                    className={`h-11 w-11 items-center justify-center rounded-full bg-canvas ${
                      submitting ? 'opacity-40' : 'active:opacity-60'
                    }`}
                  >
                    <X size={20} color={colors.textSecondary} />
                  </Pressable>
                </View>
                <ScreenHeader
                  eyebrow="YOUR ACCOUNT"
                  title={title}
                  subtitle={subtitle}
                />
                <AuthFeedback message={feedback} />
                {children}
                <AppButton
                  title={submitTitle}
                  loading={submitting}
                  disabled={submitting}
                  onPress={onSave}
                  className="mt-2"
                />
                <AppButton
                  title="Cancel"
                  variant="ghost"
                  tone="neutral"
                  disabled={submitting}
                  onPress={onClose}
                  className="mt-2"
                />
              </SectionCard>
            </Pressable>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  </AppModal>
);

export default AccountFormModal;
