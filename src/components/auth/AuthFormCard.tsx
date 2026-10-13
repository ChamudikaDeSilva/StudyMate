import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import SectionCard from '../common/SectionCard';
import AuthFeedback from './AuthFeedback';
interface AuthFormCardProps {
  title: string;
  description: string;
  submitting: boolean;
  feedback: string;
  children: ReactNode;
}
const AuthFormCard = ({
  title,
  description,
  submitting,
  feedback,
  children,
}: AuthFormCardProps) => (
  <SectionCard accessibilityState={{ busy: submitting }}>
    <View className="mb-6">
      <Text
        accessibilityRole="header"
        className="text-2xl font-bold tracking-tight text-ink"
      >
        {title}
      </Text>
      <Text className="mt-1.5 text-sm leading-5 text-muted">{description}</Text>
    </View>
    <AuthFeedback message={feedback} />
    {children}
  </SectionCard>
);
export default AuthFormCard;
