import React, { ReactNode } from 'react';
import { StatusBar, StyleSheet, View, ViewProps } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '../../constants/colors';
interface ScreenContainerProps extends ViewProps {
  children: ReactNode;
  tone?: 'light' | 'dark';
  edges?: Edge[];
}
const ScreenContainer = ({
  children,
  tone = 'light',
  edges = ['top', 'left', 'right'],
  style,
  ...viewProps
}: ScreenContainerProps) => {
  const focused = useIsFocused();

  return (
    <SafeAreaView
      {...viewProps}
      edges={edges}
      style={[styles.screen, tone === 'dark' && styles.dark, style]}
    >
      {focused && (
        <StatusBar
          barStyle={tone === 'dark' ? 'light-content' : 'dark-content'}
        />
      )}
      {tone === 'light' && (
        <View pointerEvents="none" style={styles.decoration}>
          <View style={styles.glow} />
          <View style={styles.dot} />
        </View>
      )}
      {children}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  dark: { backgroundColor: colors.darkBackground },
  decoration: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  glow: {
    position: 'absolute',
    top: -170,
    right: -120,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: colors.primarySoft,
    opacity: 0.45,
  },
  dot: {
    position: 'absolute',
    top: 100,
    right: 32,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    opacity: 0.15,
  },
});
export default ScreenContainer;
