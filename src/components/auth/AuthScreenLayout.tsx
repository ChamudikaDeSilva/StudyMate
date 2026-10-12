import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import BackButton from '../common/BackButton';
import ScreenContainer from '../common/ScreenContainer';
import AuthBrand from './AuthBrand';
interface AuthScreenLayoutProps {
  children: ReactNode;
  onBack?: () => void;
  backDisabled?: boolean;
}
const AuthScreenLayout = ({
  children,
  onBack,
  backDisabled = false,
}: AuthScreenLayoutProps) => (
  <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View className="mb-7">
            {onBack ? (
              <View className="flex-row items-center justify-between">
                <BackButton
                  accessibilityLabel="Go back to sign in"
                  disabled={backDisabled}
                  onPress={onBack}
                />
                <AuthBrand compact />
              </View>
            ) : (
              <AuthBrand />
            )}
          </View>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenContainer>
);
const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  content: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
});
export default AuthScreenLayout;
