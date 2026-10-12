import React from 'react';

import { View } from 'react-native';

import './global.css';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';

import { NetworkProvider } from './src/context/NetworkContext';

import OfflineStatusBanner from './src/components/offline/OfflineStatusBanner';

import OfflineSyncBridge from './src/components/offline/OfflineSyncBridge';

import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <View className="flex-1">
          <OfflineStatusBanner />

          <AuthProvider>
            {/*
             * Watches connectivity and
             * processes pending offline
             * operations when online.
             */}
            <OfflineSyncBridge />

            <AppNavigator />
          </AuthProvider>
        </View>
      </NetworkProvider>
    </SafeAreaProvider>
  );
};

export default App;
