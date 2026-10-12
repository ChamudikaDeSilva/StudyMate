import React from 'react';
import { Text, View } from 'react-native';
import { Lightbulb, Sparkle } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import SectionCard from '../common/SectionCard';
import AiSectionHeader from './AiSectionHeader';

interface Props {
  tips: string[];
}

const AiStudyTipsCard = ({ tips }: Props) => {
  if (tips.length === 0) {
    return null;
  }

  return (
    <SectionCard>
      <AiSectionHeader
        title="Make it stick"
        description="A few ways to revise with purpose"
        icon={Lightbulb}
        color={colors.warning}
        backgroundColor={colors.warningLight}
      />
      <View className="gap-3">
        {tips.map((tip, index) => (
          <View key={`${index}-${tip}`} className="flex-row items-start">
            <View className="mr-3 mt-1">
              <Sparkle size={16} color={colors.warning} />
            </View>
            <Text className="flex-1 text-sm leading-[23px] text-ink">
              {tip}
            </Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
};

export default AiStudyTipsCard;
