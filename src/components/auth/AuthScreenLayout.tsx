import React, {ReactNode} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import {ArrowLeft} from 'lucide-react-native';
import AuthBrand from './AuthBrand';

interface AuthScreenLayoutProps {
  children: ReactNode;
  onBack?: () => void;
}

const AuthScreenLayout = ({children, onBack}: AuthScreenLayoutProps) => {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 pb-8 pt-8">
            {onBack ? (
              <View className="mb-8 flex-row items-center justify-between">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  onPress={onBack}
                  className="h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white"
                  style={({pressed}) => ({opacity: pressed ? 0.65 : 1})}>
                  <ArrowLeft size={21} color="#0F172A" />
                </Pressable>
                <AuthBrand compact />
              </View>
            ) : (
              <View className="mb-10">
                <AuthBrand />
              </View>
            )}

            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreenLayout;
