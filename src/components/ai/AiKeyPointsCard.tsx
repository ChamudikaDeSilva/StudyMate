import React from 'react';
import { Text, View } from 'react-native';
import { ListChecks } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import SectionCard from '../common/SectionCard';
import AiSectionHeader from './AiSectionHeader';

interface Props {
  points: string[];
}

const AiKeyPointsCard = ({ points }: Props) => {
  if (points.length === 0) {
    return null;
  }

  return (
    <SectionCard>
      <AiSectionHeader
        title="Key ideas"
        description="The concepts to keep with you"
        icon={ListChecks}
        color={colors.success}
        backgroundColor={colors.successLight}
      />
      <View className="gap-4">
        {points.map((point, index) => (
          <View key={`${index}-${point}`} className="flex-row items-start">
            <View className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-brand-50">
              <Text className="text-[11px] font-bold text-brand-600">
                {index + 1}
              </Text>
            </View>
            <Text className="flex-1 text-sm leading-[23px] text-ink">
              {point}
            </Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
};

export default AiKeyPointsCard;
