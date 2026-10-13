import React from 'react';
import ScreenState from '../common/ScreenState';

const AiSummaryLoadingState = () => (
  <ScreenState
    loading
    title="Preparing your summary"
    description="Checking for a saved summary or finding the key ideas in your material."
  />
);

export default AiSummaryLoadingState;
