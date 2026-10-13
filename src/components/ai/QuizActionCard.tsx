import React from 'react';
import { CircleHelp } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import AiStudyActionCard from './AiStudyActionCard';

interface Props {
  disabled: boolean;
  onPress: () => void;
}

const QuizActionCard = ({ disabled, onPress }: Props) => (
  <AiStudyActionCard
    title="Practice quiz"
    description="Check your understanding with a few focused questions."
    icon={CircleHelp}
    color={colors.info}
    backgroundColor={colors.infoLight}
    accessibilityLabel="Open AI quiz"
    disabled={disabled}
    onPress={onPress}
  />
);

export default QuizActionCard;
