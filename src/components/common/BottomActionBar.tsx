import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import ActionButton from './ActionButton';
interface BottomActionBarProps {
  title: string;
  onPress: () => void;
}
const BottomActionBar = ({ title, onPress }: BottomActionBarProps) => (
  <View style={styles.container}>
    <ActionButton
      title={title}
      onPress={onPress}
      icon={<Plus size={20} color={colors.white} strokeWidth={2.5} />}
    />
  </View>
);
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
});
export default BottomActionBar;
