import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';

import {colors} from '../constants/colors';
import {useAuth} from '../hooks/useAuth';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const AppNavigator = () => {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user
        ? <MainNavigator />
        : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AppNavigator;