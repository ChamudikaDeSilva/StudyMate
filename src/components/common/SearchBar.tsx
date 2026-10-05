import React from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {Search, X} from 'lucide-react-native';

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
  return (
    <View className="h-[54px] flex-row items-center rounded-2xl border border-slate-200 bg-white px-4">
      <Search size={20} color="#64748B" />
      <TextInput
        className="ml-2 flex-1 py-0 text-sm text-slate-900"
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
      {!!value && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={10}
          onPress={() => onChangeText('')}
          className="h-[30px] w-[30px] items-center justify-center rounded-full bg-slate-100">
          <X size={17} color="#64748B" />
        </Pressable>
      )}
    </View>
  );
};

export default SearchBar;
