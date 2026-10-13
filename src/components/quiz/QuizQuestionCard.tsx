import React from 'react';
import { Text, View } from 'react-native';
import { MaterialQuizQuestion } from '../../domain/models/MaterialQuiz';
import SectionCard from '../common/SectionCard';
import QuizOption from './QuizOption';

interface Props {
  question: MaterialQuizQuestion;
  selectedIndex: number | null;
  onSelect: (optionIndex: number) => void;
}

const QuizQuestionCard = ({ question, selectedIndex, onSelect }: Props) => (
  <SectionCard>
    <Text className="text-[11px] font-extrabold uppercase tracking-[2px] text-brand-600">
      Question {question.position}
    </Text>
    <Text className="mt-3 text-[22px] font-bold leading-[30px] text-ink">
      {question.question}
    </Text>
    <Text className="mt-2 text-sm leading-5 text-muted">
      Choose the answer that fits best.
    </Text>
    <View
      className="mt-6"
      accessibilityRole="radiogroup"
      accessibilityLabel="Answer choices"
    >
      {question.options.map((option, index) => (
        <QuizOption
          key={`${question.id}-${index}`}
          index={index}
          text={option}
          state={selectedIndex === index ? 'selected' : 'default'}
          onPress={() => onSelect(index)}
        />
      ))}
    </View>
  </SectionCard>
);

export default QuizQuestionCard;
