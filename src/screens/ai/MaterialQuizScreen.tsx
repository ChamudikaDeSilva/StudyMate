import React, { useCallback } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { BrainCircuit } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import QuizErrorState from '../../components/quiz/QuizErrorState';
import QuizLoadingState from '../../components/quiz/QuizLoadingState';
import QuizNavigation from '../../components/quiz/QuizNavigation';
import QuizProgress from '../../components/quiz/QuizProgress';
import QuizQuestionCard from '../../components/quiz/QuizQuestionCard';
import { useMaterialQuizScreen } from '../../hooks/useMaterialQuizScreen';
import { SubjectsStackParamList } from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<SubjectsStackParamList, 'MaterialQuiz'>;

const MaterialQuizScreen = ({ navigation, route }: Props) => {
  const { materialId, subjectId, subjectName, materialTitle, forceGenerate } =
    route.params;
  const screen = useMaterialQuizScreen({ materialId, forceGenerate });

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.replace('MaterialDetails', {
      materialId,
      subjectId,
      subjectName,
    });
  }, [navigation, materialId, subjectId, subjectName]);

  const performSubmit = useCallback(async () => {
    try {
      const result = await screen.submitQuiz();
      if (!result) {
        return;
      }
      navigation.navigate('MaterialQuizResult', {
        materialId,
        subjectId,
        subjectName,
        materialTitle,
        result,
      });
    } catch (submitError) {
      Alert.alert(
        'Unable to submit quiz',
        submitError instanceof Error
          ? submitError.message
          : 'Please try again.',
      );
    }
  }, [navigation, materialId, subjectId, subjectName, materialTitle, screen]);

  const handleSubmit = useCallback(() => {
    const unanswered = screen.totalQuestions - screen.answeredCount;
    if (unanswered > 0) {
      Alert.alert(
        'Unanswered questions',
        `You still have ${unanswered} unanswered question${
          unanswered === 1 ? '' : 's'
        }. Submit anyway?`,
        [
          { text: 'Keep answering', style: 'cancel' },
          {
            text: 'Submit',
            onPress: () => {
              performSubmit();
            },
          },
        ],
      );
      return;
    }
    performSubmit();
  }, [performSubmit, screen.answeredCount, screen.totalQuestions]);

  return (
    <ScreenContainer>
      <View className="px-6 pt-5">
        <ScreenHeader
          eyebrow="Practice"
          title="Practice quiz"
          subtitle={materialTitle || subjectName}
          onBack={handleBack}
          right={
            <View className="h-11 w-11 items-center justify-center rounded-2xl border border-brand-100 bg-white">
              <BrainCircuit size={21} color="#5B4DE8" />
            </View>
          }
        />
      </View>
      {screen.initializing && !screen.quiz ? <QuizLoadingState /> : null}
      {!screen.initializing && !screen.quiz && screen.error ? (
        <QuizErrorState
          error={screen.error}
          busy={screen.busy}
          onRetry={screen.retry}
        />
      ) : null}
      {screen.quiz && screen.currentQuestion ? (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-10 pt-1">
            <QuizProgress
              current={screen.displayPosition}
              total={screen.totalQuestions}
              answered={screen.answeredCount}
              provider={screen.quiz.provider}
            />
            <QuizQuestionCard
              question={screen.currentQuestion}
              selectedIndex={screen.selectedIndex}
              onSelect={optionIndex =>
                screen.selectAnswer(screen.currentQuestion!.id, optionIndex)
              }
            />
            <QuizNavigation
              canGoPrevious={screen.canGoPrevious}
              canGoNext={screen.canGoNext}
              isLastQuestion={screen.isLastQuestion}
              submitting={screen.submitting}
              onPrevious={screen.previous}
              onNext={screen.next}
              onSubmit={handleSubmit}
            />
          </View>
        </ScrollView>
      ) : null}
    </ScreenContainer>
  );
};

export default MaterialQuizScreen;
