import React from 'react';
import { Sparkles } from 'lucide-react-native';
import { MaterialSummary } from '../../domain/models/MaterialSummary';
import OverviewCard from '../common/OverviewCard';

interface Props {
  summary: MaterialSummary;
  fallbackTitle: string;
}

const AiSummaryOverviewCard = ({ summary, fallbackTitle }: Props) => (
  <OverviewCard
    kicker="YOUR MATERIAL, MADE CLEARER"
    value={summary.title || fallbackTitle}
    description="Start with the big picture. Then work through the ideas below."
    icon={Sparkles}
  />
);

export default AiSummaryOverviewCard;
