import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react-native';
import SectionCard from '../common/SectionCard';
import { colors } from '../../constants/colors';
import { Subject } from '../../domain/models/Subject';

interface HomeStudyCardProps {
  subject: Subject;
  onPress: () => void;
}

const HomeStudyCard = ({ subject, onPress }: HomeStudyCardProps) => {
  const description = subject.description?.trim();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${subject.name}`}
      accessibilityHint="Open this subject's materials to start studying"
      onPress={onPress}
      className="active:opacity-80"
    >
      <SectionCard style={styles.surface} className="overflow-hidden">
        <View className="mb-5 flex-row items-center">
          <View className="mr-2 h-6 w-6 items-center justify-center rounded-full bg-white">
            <Sparkles size={13} color={colors.primary} />
          </View>
          <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-brand-700">
            A place to start
          </Text>
        </View>

        <View className="flex-row items-center">
          <View className="mr-4 flex-1">
            <Text className="mb-2 text-xs font-medium text-muted">
              Recently updated
            </Text>
            <Text
              numberOfLines={3}
              className="text-[25px] font-bold leading-[31px] tracking-tight text-ink"
            >
              {subject.name}
            </Text>
          </View>
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.illustration}
          >
            <View style={styles.backCard} />
            <View style={styles.frontCard}>
              <BookOpen size={34} color={colors.white} strokeWidth={1.7} />
              <View style={styles.pageLine} />
              <View style={styles.shortLine} />
            </View>
          </View>
        </View>

        <Text
          numberOfLines={2}
          className="mt-4 text-sm leading-[22px] text-muted"
        >
          {description && description !== subject.name
            ? description
            : 'Open a material, explore an idea, and take it one step further.'}
        </Text>
        <View className="mt-5 flex-row items-center justify-between border-t border-brand-100 pt-4">
          <Text className="text-sm font-bold text-brand-700">
            Open materials
          </Text>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-600">
            <ArrowRight size={20} color={colors.white} />
          </View>
        </View>
      </SectionCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primarySoft,
  },
  illustration: { width: 90, height: 108, marginRight: 4 },
  backCard: {
    position: 'absolute',
    top: 10,
    left: 1,
    width: 77,
    height: 91,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    transform: [{ rotate: '-12deg' }],
  },
  frontCard: {
    position: 'absolute',
    top: 1,
    right: 0,
    width: 77,
    height: 96,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '9deg' }],
  },
  pageLine: {
    width: 30,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.white,
    opacity: 0.4,
    marginTop: 12,
  },
  shortLine: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.white,
    opacity: 0.25,
    marginTop: 5,
  },
});

export default HomeStudyCard;
