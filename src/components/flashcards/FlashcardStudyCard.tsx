import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Layers, RotateCcw } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { Flashcard } from '../../domain/models/MaterialFlashcards';

interface Props {
  card: Flashcard;
  answerVisible: boolean;
  onToggle: () => void;
}

const FlashcardStudyCard = ({ card, answerVisible, onToggle }: Props) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={
      answerVisible ? 'Hide flashcard answer' : 'Reveal flashcard answer'
    }
    accessibilityHint="Turns the card to show its other side"
    accessibilityState={{ expanded: answerVisible }}
    accessibilityValue={{ text: answerVisible ? card.back : card.front }}
    onPress={onToggle}
    activeOpacity={0.9}
    style={[
      styles.card,
      answerVisible ? styles.answer : styles.question,
    ]}
  >
    <View
      pointerEvents="none"
      style={[styles.decoration, answerVisible && styles.hidden]}
    />
    <View style={styles.header}>
      <View style={[styles.badge, answerVisible ? styles.answerBadge : styles.questionBadge]}>
        <Text style={[styles.label, answerVisible ? styles.answerLabel : styles.questionLabel]}>
          {answerVisible ? 'The answer' : 'Recall the idea'}
        </Text>
      </View>
      <Layers
        size={22}
        color={answerVisible ? colors.primary : colors.white}
        strokeWidth={1.8}
      />
    </View>
    <View style={styles.content}>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.text, answerVisible ? styles.answerText : styles.questionText]}
      >
        {answerVisible ? card.back : card.front}
      </Text>
    </View>
    <View style={[styles.footer, answerVisible ? styles.answerFooter : styles.questionFooter]}>
      <View style={styles.footerIcon}>
        <RotateCcw
          size={15}
          color={answerVisible ? colors.textSecondary : colors.white}
        />
      </View>
      <Text style={[styles.hint, answerVisible ? styles.answerHint : styles.questionHint]}>
        {answerVisible ? 'Tap to see the question' : 'Tap to reveal the answer'}
      </Text>
    </View>
  </TouchableOpacity>
);

// Keep the native view tree and clipping consistent through every flip.
const styles = StyleSheet.create({
  card: { minHeight: 350, borderRadius: 28, borderWidth: 1, overflow: 'hidden', padding: 24 },
  question: { backgroundColor: colors.primary, borderColor: colors.primary },
  answer: { backgroundColor: colors.surface, borderColor: colors.border },
  decoration: {
    position: 'absolute', right: -48, top: -64, width: 192, height: 192,
    borderRadius: 96, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  hidden: { opacity: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  answerBadge: { backgroundColor: colors.primaryLight },
  questionBadge: { backgroundColor: 'rgba(255,255,255,0.15)' },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.55 },
  answerLabel: { color: colors.primary },
  questionLabel: { color: colors.white },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  text: { alignSelf: 'stretch', textAlign: 'center', fontWeight: '600' },
  questionText: { color: colors.white, fontSize: 24, lineHeight: 36 },
  answerText: { color: colors.textPrimary, fontSize: 22, lineHeight: 32 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, paddingTop: 16 },
  questionFooter: { borderTopColor: 'rgba(255,255,255,0.2)' },
  answerFooter: { borderTopColor: colors.border },
  footerIcon: { marginRight: 8 },
  hint: { flexShrink: 1, textAlign: 'center', fontSize: 14, fontWeight: '500', lineHeight: 20 },
  answerHint: { color: colors.textSecondary },
  questionHint: { color: 'rgba(255,255,255,0.85)' },
});

export default FlashcardStudyCard;
