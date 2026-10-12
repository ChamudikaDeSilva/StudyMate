import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '../../constants/app';
import { colors } from '../../constants/colors';

interface AuthBrandProps {
  compact?: boolean;
}

const AuthBrand = ({ compact = false }: AuthBrandProps) => {
  return (
    <View
      className="flex-row flex-shrink items-center"
      accessible
      accessibilityLabel={APP_NAME}
    >
      <View
        className={`${
          compact ? 'h-11 w-11 rounded-2xl' : 'h-16 w-16 rounded-[22px]'
        } shrink-0 items-center justify-center border border-white bg-white`}
        style={styles.logoTile}
      >
        <Image
          source={require('../../assets/images/learnloop-logo.png')}
          className={compact ? 'h-10 w-10' : 'h-14 w-14'}
          resizeMode="contain"
          accessible={false}
        />
      </View>
      <View className="ml-3 flex-shrink">
        <Text
          className={`${
            compact ? 'text-base' : 'text-[22px]'
          } font-bold tracking-tight text-slate-900`}
        >
          {APP_NAME}
        </Text>
        {!compact && (
          <Text className="mt-1 text-[13px] text-slate-500">
            Learn smarter, every day.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoTile: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
});

export default AuthBrand;
