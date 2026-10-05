import React from 'react';
import {Text, View} from 'react-native';
import {Sparkles} from 'lucide-react-native';

interface AuthBrandProps {
  compact?: boolean;
}

const AuthBrand = ({compact = false}: AuthBrandProps) => {
  return (
    <View className="flex-row items-center">
      <View
        className={`${compact ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-2xl'} items-center justify-center bg-indigo-600`}>
        <Sparkles size={compact ? 18 : 22} color="#FFFFFF" strokeWidth={2.3} />
      </View>
      <View className="ml-3">
        <Text className={`${compact ? 'text-base' : 'text-xl'} font-bold text-slate-900`}>
          LearnLoop AI
        </Text>
        {!compact && (
          <Text className="mt-0.5 text-xs text-slate-500">Learn smarter every day</Text>
        )}
      </View>
    </View>
  );
};

export default AuthBrand;
