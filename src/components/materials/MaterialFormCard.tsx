import React, { ReactNode } from 'react';
import { Text } from 'react-native';
import SectionCard from '../common/SectionCard';

interface MaterialFormCardProps {
  title: string;
  children: ReactNode;
}

const MaterialFormCard = ({ title, children }: MaterialFormCardProps) => {
  return (
    <SectionCard>
      <Text className="mb-5 text-lg font-bold text-ink">{title}</Text>
      {children}
    </SectionCard>
  );
};

export default MaterialFormCard;
