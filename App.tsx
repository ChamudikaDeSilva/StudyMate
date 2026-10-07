import React from 'react';

import {
  View,
} from 'react-native';

import './global.css';

import {
  AuthProvider,
} from './src/context/AuthContext';

import {
  NetworkProvider,
} from './src/context/NetworkContext';

import OfflineStatusBanner
  from './src/components/offline/OfflineStatusBanner';

import AppNavigator
  from './src/navigation/AppNavigator';


const App = () => {

  return (

    <NetworkProvider>

      <View
        className="
          flex-1
        ">

        {/* ===================================================
            GLOBAL NETWORK STATUS

            Offline:
            Amber banner remains visible.

            Reconnected:
            Green "Back online" banner appears briefly.
        ==================================================== */}

        <OfflineStatusBanner />


        {/* ===================================================
            APPLICATION
        ==================================================== */}

        <AuthProvider>

          <AppNavigator />

        </AuthProvider>

      </View>

    </NetworkProvider>
  );
};


export default App;