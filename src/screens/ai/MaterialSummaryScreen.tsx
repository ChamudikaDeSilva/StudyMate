import React, { useCallback } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AiSummaryErrorState from '../../components/ai/AiSummaryErrorState';
import AiSummaryLoadingState from '../../components/ai/AiSummaryLoadingState';
import AiSummaryResult from '../../components/ai/AiSummaryResult';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useMaterialSummaryScreen } from '../../hooks/useMaterialSummaryScreen';
import { SubjectsStackParamList } from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<SubjectsStackParamList, 'MaterialSummary'>;

const MaterialSummaryScreen = ({ navigation, route }: Props) => {
  const { materialId, subjectId, subjectName, materialTitle } = route.params;
  const screen = useMaterialSummaryScreen({ materialId });

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
          eyebrow="READ & UNDERSTAND"
          title="AI summary"
          subtitle={subjectName}
          onBack={handleBack}
        />
      </View>
      {screen.initializing && !screen.summary && <AiSummaryLoadingState />}
      {!screen.initializing && !screen.summary && screen.error && (
        <AiSummaryErrorState
          error={screen.error}
          generating={screen.busy}
          onRetry={screen.retry}
        />
      )}
      {screen.summary && (
        <AiSummaryResult
          summary={screen.summary}
          materialTitle={materialTitle}
          generating={screen.generating}
          onGenerateAgain={screen.generateSummary}
        />
      )}
    </ScreenContainer>
  );
};

export default MaterialSummaryScreen;
