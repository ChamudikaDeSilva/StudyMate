import React from 'react';
import { BrainCircuit } from 'lucide-react-native';
import ScreenState from '../common/ScreenState';

interface Props {
  error: string;
  busy: boolean;
  onRetry: () => void;
}

const QuizErrorState = ({ error, busy, onRetry }: Props) => (
  <ScreenState
    title="Couldn't load quiz"
    description={error}
    icon={BrainCircuit}
    actionTitle="Try again"
    actionBusy={busy}
    onAction={onRetry}
  />
);

export default QuizErrorState;
