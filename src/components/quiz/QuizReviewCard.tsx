import React from 'react';
import { Text, View } from 'react-native';
import { CheckCircle2, CircleMinus, XCircle } from 'lucide-react-native';
import { QuizAnswerResult } from '../../domain/models/MaterialQuiz';
import SectionCard from '../common/SectionCard';
import QuizOption from './QuizOption';

interface Props {
  answer: QuizAnswerResult;
}

const QuizReviewCard = ({ answer }: Props) => {
  const skipped = answer.selectedIndex === null;
  const status = skipped
    ? 'Not answered'
    : answer.isCorrect
    ? 'Correct'
    : 'Review';
  const color = skipped ? '#98621D' : answer.isCorrect ? '#18704A' : '#B62C4D';
  const StatusIcon = skipped
    ? CircleMinus
    : answer.isCorrect
    ? CheckCircle2
    : XCircle;

  return (
    <SectionCard className="mb-4">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-[11px] font-extrabold uppercase tracking-[2px] text-muted">
          Question {answer.position}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <StatusIcon size={15} color={color} />
          <Text className="text-xs font-bold" style={{ color }}>
            {status}
          </Text>
        </View>
      </View>
      <Text className="mt-3 text-base font-bold leading-6 text-ink">
        {answer.question}
      </Text>
      <View className="mt-5">
        {answer.options.map((option, index) => {
          const correct = index === answer.correctIndex;
          const selected = index === answer.selectedIndex;
          return (
            <QuizOption
              key={`${answer.questionId}-${index}`}
              index={index}
              text={option}
              state={correct ? 'correct' : selected ? 'incorrect' : 'default'}
              caption={
                correct
                  ? selected
                    ? 'Your answer · Correct'
                    : 'Correct answer'
                  : selected
                  ? 'Your answer'
                  : undefined
              }
            />
          );
        })}
      </View>
      {skipped ? (
        <Text className="mb-3 text-sm font-semibold text-amber-700">
          You did not answer this question.
        </Text>
      ) : null}
      <View className="rounded-2xl bg-brand-50 p-4">
        <Text className="text-[10px] font-extrabold uppercase tracking-[2px] text-brand-600">
          Why this answer?
        </Text>
        <Text className="mt-2 text-sm leading-[22px] text-muted">
          {answer.explanation}
        </Text>
      </View>
    </SectionCard>
  );
};

export default QuizReviewCard;
