import React from 'react';
import ProgressCard from '../common/ProgressCard';

interface Props {
  current: number;
  total: number;
  provider: string;
}

const FlashcardProgress = ({ current, total }: Props) => (
  <ProgressCard
    label="Flashcard practice"
    current={current}
    total={total}
    description={`Card ${current} of ${total}`}
    caption="Think of your answer before turning the card."
  />
);

export default FlashcardProgress;
