import React from 'react';
import { View } from 'react-native';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react-native';
import AppButton from '../common/AppButton';

interface Props {
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  submitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const QuizNavigation = ({
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  submitting,
  onPrevious,
  onNext,
  onSubmit,
}: Props) => (
  <View className="mt-5 flex-row gap-3">
    <AppButton
      title="Previous"
      variant="outline"
      disabled={!canGoPrevious || submitting}
      onPress={onPrevious}
      icon={<ChevronLeft size={18} color="#5B4DE8" />}
      className="flex-1"
    />
    {isLastQuestion ? (
      <AppButton
        title={submitting ? 'Submitting...' : 'Submit quiz'}
        onPress={onSubmit}
        loading={submitting}
        tone="success"
        icon={<CheckCircle2 size={18} color="#FFFFFF" />}
        className="flex-1"
      />
    ) : (
      <AppButton
        title="Next"
        disabled={!canGoNext || submitting}
        onPress={onNext}
        icon={<ChevronRight size={18} color="#FFFFFF" />}
        className="flex-1"
      />
    )}
  </View>
);

export default QuizNavigation;
