import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LucideIcon, Sparkles } from 'lucide-react-native';
import { colors } from '../../constants/colors';
interface OverviewCardProps {
  kicker: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}
const OverviewCard = ({
  kicker,
  value,
  description,
  icon: Icon,
}: OverviewCardProps) => (
  <View
    className="relative min-h-[156px] overflow-hidden rounded-[28px] bg-brand-600 p-6"
    style={styles.shadow}
  >
    <View
      pointerEvents="none"
      className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10"
    />
    <View
      pointerEvents="none"
      className="absolute -bottom-16 right-12 h-36 w-36 rounded-full bg-brand-300/25"
    />
    <View className="mb-5 flex-row items-center justify-between">
      <Text className="flex-1 text-[10px] font-bold uppercase tracking-[1.8px] text-brand-100">
        {kicker}
      </Text>
      <Sparkles size={15} color={colors.primarySoft} />
    </View>
    <View className="flex-row items-center">
      <View className="mr-4 h-14 w-14 items-center justify-center rounded-[18px] bg-white/15">
        <Icon size={25} color={colors.white} />
      </View>
      <View className="flex-1">
        <Text
          className={
            typeof value === 'number'
              ? 'text-[32px] font-bold tracking-tight text-white'
              : 'text-[22px] font-bold leading-7 tracking-tight text-white'
          }
        >
          {value}
        </Text>
        <Text className="mt-1 text-xs leading-[18px] text-brand-100">
          {description}
        </Text>
      </View>
    </View>
  </View>
);
const styles = StyleSheet.create({
  shadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
});
export default OverviewCard;
