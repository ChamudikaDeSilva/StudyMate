import React from 'react';
import { Sparkles } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import AiStudyActionCard from './AiStudyActionCard';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

const AiSummaryActionCard = ({ onPress, disabled = false }: Props) => (
  <AiStudyActionCard
    title="AI summary"
    description="Find the key ideas and a clearer way to study them."
    icon={Sparkles}
    color={colors.primary}
    backgroundColor={colors.primaryLight}
    accessibilityLabel="Open AI summary"
    onPress={onPress}
    disabled={disabled}
  />
);

export default AiSummaryActionCard;
