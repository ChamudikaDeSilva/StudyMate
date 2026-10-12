import React from 'react';
import ScreenState from '../common/ScreenState';

const FlashcardLoadingState = () => (
  <ScreenState
    loading
    title="Preparing your flashcards"
    description="Checking for a saved deck or creating one from your study material."
  />
);

export default FlashcardLoadingState;
