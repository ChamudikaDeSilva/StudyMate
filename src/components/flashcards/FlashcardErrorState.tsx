import React from 'react';
import { Layers } from 'lucide-react-native';
import ScreenState from '../common/ScreenState';

interface Props {
  error: string;
  busy: boolean;
  onRetry: () => void;
}

const FlashcardErrorState = ({ error, busy, onRetry }: Props) => (
  <ScreenState
    title="Flashcards unavailable"
    description={error}
    icon={Layers}
    actionTitle="Try again"
    actionBusy={busy}
    onAction={onRetry}
  />
);

export default FlashcardErrorState;
