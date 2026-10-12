import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors } from '../../constants/colors';
interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}
const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}: SearchBarProps) => {
  const [focused, setFocused] = useState(false);
  return (
    <View
      className="min-h-[54px] flex-row items-center rounded-[18px] border bg-white px-4"
      style={[styles.border, focused && styles.focused]}
    >
      <Search size={20} color={focused ? colors.primary : colors.textMuted} />
      <TextInput
        accessibilityLabel={placeholder}
        className="ml-3 min-h-[54px] flex-1 py-2 text-sm text-ink"
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {!!value && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={() => onChangeText('')}
          className="ml-1 h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:opacity-60"
        >
          <X size={17} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  border: { borderColor: colors.border },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
});
export default SearchBar;
