import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { MaterialSummary } from '../../domain/models/MaterialSummary';
import AppButton from '../common/AppButton';
import AiKeyPointsCard from './AiKeyPointsCard';
import AiStudyTipsCard from './AiStudyTipsCard';
import AiSummaryCard from './AiSummaryCard';
import AiSummaryOverviewCard from './AiSummaryOverviewCard';

interface Props {
  summary: MaterialSummary;
  materialTitle: string;
  generating: boolean;
  onGenerateAgain: () => void;
}

const AiSummaryResult = ({
  summary,
  materialTitle,
  generating,
  onGenerateAgain,
}: Props) => (
  <ScrollView
    className="flex-1"
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.content}
  >
    <View className="gap-4">
      <AiSummaryOverviewCard summary={summary} fallbackTitle={materialTitle} />
      <AiSummaryCard summary={summary.summary} />
      <AiKeyPointsCard points={summary.keyPoints} />
      <AiStudyTipsCard tips={summary.studyTips} />
      <AppButton
        title="Refresh summary"
        onPress={onGenerateAgain}
        loading={generating}
        variant="soft"
        icon={<RefreshCw size={18} color={colors.primary} />}
      />
    </View>
    <Text className="mt-4 text-center text-xs leading-[18px] text-muted">
      AI can make mistakes. Check important points against your original
      material.
    </Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 36 },
});

export default AiSummaryResult;
