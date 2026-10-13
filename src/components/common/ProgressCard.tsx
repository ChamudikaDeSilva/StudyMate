import React from 'react';
import { Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import SectionCard from './SectionCard';
interface ProgressCardProps {
  label: string;
  current: number;
  total: number;
  description?: string;
  caption?: string;
}
const ProgressCard = ({
  label,
  current,
  total,
  description,
  caption,
}: ProgressCardProps) => {
  const safeTotal = Number.isFinite(total) ? Math.max(0, total) : 0;
  const safeCurrent = Number.isFinite(current)
    ? Math.max(0, Math.min(current, safeTotal))
    : 0;
  const percentage =
    safeTotal > 0 ? Math.round((safeCurrent / safeTotal) * 100) : 0;
  return (
    <SectionCard className="mb-5">
      <View className="flex-row items-center">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
          <Sparkles size={20} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted">
            {label}
          </Text>
          <Text className="mt-1 text-base font-bold text-ink">
            {description || `${safeCurrent} of ${safeTotal}`}
          </Text>
        </View>
        <View className="ml-3 rounded-full bg-brand-50 px-3 py-2">
          <Text className="text-xs font-bold text-brand-700">
            {percentage}%
          </Text>
        </View>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: safeTotal, now: safeCurrent }}
        className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
      >
        <View
          className="h-full rounded-full bg-brand-600"
          style={{ width: `${percentage}%` }}
        />
      </View>
      {!!caption && (
        <Text className="mt-3 text-xs leading-5 text-muted">{caption}</Text>
      )}
    </SectionCard>
  );
};
export default ProgressCard;
