import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface AuthSwitchLinkProps {
  prompt: string;
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const AuthSwitchLink = ({
  prompt,
  title,
  onPress,
  disabled = false,
}: AuthSwitchLinkProps) => (
  <View className="mt-5 flex-row flex-wrap items-center justify-center">
    <Text className="text-sm text-slate-500">{prompt}</Text>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      className={`min-h-[44px] items-center justify-center px-2 ${
        disabled ? 'opacity-55' : 'active:opacity-55'
      }`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className="text-sm font-bold text-indigo-600">{title}</Text>
    </Pressable>
  </View>
);

export default AuthSwitchLink;
