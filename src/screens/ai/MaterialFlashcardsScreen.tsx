import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FlashcardErrorState from '../../components/flashcards/FlashcardErrorState';
import FlashcardLoadingState from '../../components/flashcards/FlashcardLoadingState';
import FlashcardNavigation from '../../components/flashcards/FlashcardNavigation';
import FlashcardProgress from '../../components/flashcards/FlashcardProgress';
import FlashcardStudyCard from '../../components/flashcards/FlashcardStudyCard';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import ScreenState from '../../components/common/ScreenState';
import { useMaterialFlashcardsScreen } from '../../hooks/useMaterialFlashcardsScreen';
import { SubjectsStackParamList } from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<
  SubjectsStackParamList,
  'MaterialFlashcards'
>;

const MaterialFlashcardsScreen = ({ navigation, route }: Props) => {
  const { materialId, subjectId, subjectName, materialTitle } = route.params;
  const screen = useMaterialFlashcardsScreen({ materialId });

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

  return (
    <ScreenContainer>
      <View className="px-6 pt-5">
        <ScreenHeader
          eyebrow="BUILD YOUR RECALL"
          title="Flashcards"
          subtitle={materialTitle || subjectName}
          onBack={handleBack}
        />
      </View>
      {screen.initializing && !screen.deck && <FlashcardLoadingState />}
      {!screen.initializing && !screen.deck && screen.error && (
        <FlashcardErrorState
          error={screen.error}
          busy={screen.busy}
          onRetry={screen.retry}
        />
      )}
      {screen.deck && screen.currentCard && (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <FlashcardProgress
            current={screen.displayPosition}
            total={screen.totalCards}
            provider={screen.deck.provider}
          />
          <FlashcardStudyCard
            card={screen.currentCard}
            answerVisible={screen.answerVisible}
            onToggle={screen.toggleAnswer}
          />
          <FlashcardNavigation
            canGoPrevious={screen.canGoPrevious}
            canGoNext={screen.canGoNext}
            generating={screen.generating}
            onPrevious={screen.previous}
            onNext={screen.next}
            onGenerateAgain={screen.generateAgain}
          />
        </ScrollView>
      )}
      {screen.deck && !screen.currentCard && !screen.initializing && (
        <ScreenState
          title="This deck has no cards"
          description="Create a fresh deck from this material to begin practicing."
          actionTitle="Create flashcards"
          actionBusy={screen.generating}
          onAction={screen.generateAgain}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 36 },
});

export default MaterialFlashcardsScreen;
