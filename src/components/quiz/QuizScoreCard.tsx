import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sparkles, Trophy } from 'lucide-react-native';
import SectionCard from '../common/SectionCard';
import { colors } from '../../constants/colors';

interface Props {
  score: number;
  total: number;
  percentage: number;
}

const QuizScoreCard = ({ score, total, percentage }: Props) => {
  const message =
    percentage >= 80
      ? 'Great work!'
      : percentage >= 60
      ? 'Good progress.'
      : 'Keep reviewing.';
  const description =
    percentage >= 80
      ? 'Your understanding is coming together.'
      : percentage >= 60
      ? 'Review the explanations to build on what you know.'
      : 'Every answer is a chance to learn something new.';

  return (
    <SectionCard
      className="items-center overflow-hidden py-7"
      style={styles.card}
    >
      <View
        pointerEvents="none"
        className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10"
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-white/5"
      />
      <View className="mb-5 flex-row items-center gap-2">
        <Sparkles size={14} color={colors.primarySoft} />
        <Text className="text-[11px] font-extrabold uppercase tracking-[2px] text-white/80">
          Practice complete
        </Text>
      </View>
      <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-white/15">
        <Trophy size={30} color={colors.white} />
      </View>
      <Text className="mt-4 text-[56px] font-extrabold tracking-[-2px] text-white">
        {percentage.toFixed(0)}%
      </Text>
      <Text className="mt-1 text-base font-semibold text-white/85">
        {score} of {total} correct
      </Text>
      <Text className="mt-5 text-[22px] font-bold text-white">{message}</Text>
      <Text className="mt-2 max-w-[280px] text-center text-sm leading-[22px] text-white/80">
        {description}
      </Text>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primary, borderColor: colors.primary },
});

export default QuizScoreCard;
