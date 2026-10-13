import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Layers, RotateCcw } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { Flashcard } from '../../domain/models/MaterialFlashcards';

interface Props {
  card: Flashcard;
  answerVisible: boolean;
  onToggle: () => void;
}

const FlashcardStudyCard = ({ card, answerVisible, onToggle }: Props) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={
      answerVisible ? 'Hide flashcard answer' : 'Reveal flashcard answer'
    }
    accessibilityHint="Turns the card to show its other side"
    accessibilityState={{ expanded: answerVisible }}
    accessibilityValue={{ text: answerVisible ? card.back : card.front }}
    onPress={onToggle}
    className={
      answerVisible
        ? 'min-h-[350px] rounded-[28px] border border-line bg-white p-6 active:opacity-90'
        : 'min-h-[350px] overflow-hidden rounded-[28px] bg-brand-600 p-6 active:opacity-90'
    }
  >
    {!answerVisible && (
      <View
        pointerEvents="none"
        className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10"
      />
    )}
    <View className="flex-row items-center justify-between">
      <View
        className={
          answerVisible
            ? 'rounded-full bg-brand-50 px-3 py-2'
            : 'rounded-full bg-white/15 px-3 py-2'
        }
      >
        <Text
          className={
            answerVisible
              ? 'text-[11px] font-bold uppercase tracking-wider text-brand-600'
              : 'text-[11px] font-bold uppercase tracking-wider text-white'
          }
        >
          {answerVisible ? 'The answer' : 'Recall the idea'}
        </Text>
      </View>
      <Layers
        size={22}
        color={answerVisible ? colors.primary : colors.white}
        strokeWidth={1.8}
      />
    </View>
    <View className="flex-1 items-center justify-center py-10">
      <Text
        accessibilityLiveRegion="polite"
        className={
          answerVisible
            ? 'text-center text-[22px] font-semibold leading-8 text-ink'
            : 'text-center text-[24px] font-semibold leading-9 text-white'
        }
      >
        {answerVisible ? card.back : card.front}
      </Text>
    </View>
    <View
      className={
        answerVisible
          ? 'flex-row items-center justify-center border-t border-line pt-4'
          : 'flex-row items-center justify-center border-t border-white/20 pt-4'
      }
    >
      <View className="mr-2">
        <RotateCcw
          size={15}
          color={answerVisible ? colors.textSecondary : colors.white}
        />
      </View>
      <Text
        className={
          answerVisible
            ? 'text-center text-sm font-medium text-muted'
            : 'text-center text-sm font-medium text-white/85'
        }
      >
        {answerVisible ? 'Tap to see the question' : 'Tap to reveal the answer'}
      </Text>
    </View>
  </Pressable>
);

export default FlashcardStudyCard;
