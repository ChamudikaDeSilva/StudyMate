import React from 'react';
import { Layers } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import AiStudyActionCard from './AiStudyActionCard';

interface Props {
  disabled: boolean;
  onPress: () => void;
}

const FlashcardsActionCard = ({ disabled, onPress }: Props) => (
  <AiStudyActionCard
    title="Flashcards"
    description="Build recall, one question and answer at a time."
    icon={Layers}
    color={colors.primaryPressed}
    backgroundColor={colors.primarySoft}
    accessibilityLabel="Open AI flashcards"
    disabled={disabled}
    onPress={onPress}
  />
);

export default FlashcardsActionCard;
