import React, { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import QuizReviewCard from '../../components/quiz/QuizReviewCard';
import QuizScoreCard from '../../components/quiz/QuizScoreCard';
import { SubjectsStackParamList } from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<
  SubjectsStackParamList,
  'MaterialQuizResult'
>;

const MaterialQuizResultScreen = ({ navigation, route }: Props) => {
  const { materialId, subjectId, subjectName, materialTitle, result } =
    route.params;

  // Return past the result and quiz screens to the material details.
  const handleMaterial = useCallback(() => navigation.pop(2), [navigation]);

  const handleNewQuiz = useCallback(() => {
    navigation.replace('MaterialQuiz', {
      materialId,
      subjectId,
      subjectName,
      materialTitle,
      forceGenerate: true,
    });
  }, [navigation, materialId, subjectId, subjectName, materialTitle]);

  return (
    <ScreenContainer>
      <View className="px-6 pt-5">
        <ScreenHeader
          eyebrow="Your practice"
          title="Quiz results"
          subtitle={materialTitle || subjectName}
          onBack={handleMaterial}
        />
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-10 pt-1">
          <QuizScoreCard
            score={result.score}
            total={result.totalQuestions}
            percentage={result.percentage}
          />
          <View className="mb-5 mt-7">
            <Text className="text-xl font-bold tracking-[-0.5px] text-ink">
              Learn from your answers
            </Text>
            <Text className="mt-1 text-sm leading-5 text-muted">
              Review each explanation, then give it another go.
            </Text>
          </View>
          {result.answers.map(answer => (
            <QuizReviewCard key={answer.questionId} answer={answer} />
          ))}
          <AppButton
            title="Try a new quiz"
            onPress={handleNewQuiz}
            icon={<RefreshCw size={18} color="#FFFFFF" />}
            className="mt-2"
          />
          <AppButton
            title="Back to material"
            onPress={handleMaterial}
            variant="outline"
            icon={<ArrowLeft size={18} color="#5B4DE8" />}
            className="mt-3"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default MaterialQuizResultScreen;
