import React from 'react';
import ProgressCard from '../common/ProgressCard';

interface Props {
  current: number;
  total: number;
  answered: number;
  provider: string;
}

const QuizProgress = ({ current, total, answered }: Props) => (
  <ProgressCard
    label="Quiz progress"
    current={current}
    total={total}
    description={`Question ${current} of ${total}`}
    caption={`${answered} answered`}
  />
);

export default QuizProgress;
