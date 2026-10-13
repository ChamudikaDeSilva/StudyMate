import React from 'react';
import { RefreshCw } from 'lucide-react-native';
import ScreenState from '../common/ScreenState';

interface Props {
  error: string;
  generating: boolean;
  onRetry: () => void;
}

const AiSummaryErrorState = ({ error, generating, onRetry }: Props) => (
  <ScreenState
    title="Summary unavailable"
    description={error}
    icon={RefreshCw}
    actionTitle="Try again"
    actionBusy={generating}
    onAction={onRetry}
  />
);

export default AiSummaryErrorState;
