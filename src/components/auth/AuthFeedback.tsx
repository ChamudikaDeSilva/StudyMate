import React from 'react';
import { Text, View } from 'react-native';
import { CircleAlert } from 'lucide-react-native';

interface AuthFeedbackProps {
  message: string;
}

const AuthFeedback = ({ message }: AuthFeedbackProps) => {
  if (!message) {
    return null;
  }

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
      className="mb-5 flex-row items-start rounded-2xl border border-rose-100 bg-rose-50 p-3.5"
    >
      <View className="mt-0.5">
        <CircleAlert size={18} color="#BE3455" />
      </View>
      <Text className="ml-2.5 flex-1 text-sm leading-5 text-rose-800">
        {message}
      </Text>
    </View>
  );
};

export default AuthFeedback;
