import React from 'react';
import ScreenState from '../common/ScreenState';

const QuizLoadingState = () => (
  <ScreenState
    loading
    title="Preparing your quiz"
    description="Checking for a saved quiz or creating questions from your material."
  />
);

export default QuizLoadingState;
