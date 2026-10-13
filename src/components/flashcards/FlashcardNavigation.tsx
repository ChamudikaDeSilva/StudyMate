import React from 'react';
import { View } from 'react-native';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import AppButton from '../common/AppButton';

interface Props {
  canGoPrevious: boolean;
  canGoNext: boolean;
  generating: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGenerateAgain: () => void;
}

const FlashcardNavigation = ({
  canGoPrevious,
  canGoNext,
  generating,
  onPrevious,
  onNext,
  onGenerateAgain,
}: Props) => (
  <View className="mt-5 gap-3">
    <View className="flex-row gap-3">
      <AppButton
        title="Previous"
        onPress={onPrevious}
        disabled={!canGoPrevious}
        variant="outline"
        icon={<ChevronLeft size={18} color={colors.primary} />}
        className="flex-1"
      />
      <AppButton
        title="Next card"
        onPress={onNext}
        disabled={!canGoNext}
        icon={<ChevronRight size={18} color={colors.white} />}
        className="flex-1"
      />
    </View>
    <AppButton
      title="Refresh flashcards"
      onPress={onGenerateAgain}
      loading={generating}
      variant="ghost"
      icon={<RefreshCw size={17} color={colors.primary} />}
    />
  </View>
);

export default FlashcardNavigation;
