import React from 'react';
import { Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import SectionCard from '../common/SectionCard';
import AiSectionHeader from './AiSectionHeader';

interface Props {
  summary: string;
}

const AiSummaryCard = ({ summary }: Props) => (
  <SectionCard>
    <AiSectionHeader
      title="The essentials"
      description="A concise overview of your material"
      icon={Sparkles}
    />
    <Text className="text-[15px] leading-7 text-ink">{summary}</Text>
  </SectionCard>
);

export default AiSummaryCard;
