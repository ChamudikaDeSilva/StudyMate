import {
  useCallback,
} from 'react';

import {
  Alert,
} from 'react-native';

import {
  useNetwork,
} from './useNetwork';


export const useOnlineGuard = () => {

  const {
    isOnline,
    initialized,
  } = useNetwork();


  // =========================================================
  // REQUIRE ONLINE
  // =========================================================

  const requireOnline =
    useCallback(
      (
        featureName:
          string = 'This feature',
      ): boolean => {

        // -----------------------------------------------------
        // Network state is still being determined
        // -----------------------------------------------------

        if (
          !initialized
        ) {

          Alert.alert(
            'Checking connection',
            'Please wait a moment while LearnLoop checks your internet connection.',
          );


          return false;
        }


        // -----------------------------------------------------
        // Offline
        // -----------------------------------------------------

        if (
          !isOnline
        ) {

          Alert.alert(
            'Internet connection required',
            `${featureName} needs an internet connection. Please reconnect and try again.`,
          );


          return false;
        }


        // -----------------------------------------------------
        // Online
        // -----------------------------------------------------

        return true;

      },
      [
        initialized,
        isOnline,
      ],
    );


  // =========================================================
  // RUN ONLINE ACTION
  // =========================================================

  const runOnlineAction =
    useCallback(
      (
        featureName:
          string,

        action:
          () => void,
      ): void => {

        const allowed =
          requireOnline(
            featureName,
          );


        if (
          !allowed
        ) {

          return;
        }


        action();

      },
      [
        requireOnline,
      ],
    );


  // =========================================================
  // RETURN
  // =========================================================

  return {

    isOnline,

    networkInitialized:
      initialized,

    requireOnline,

    runOnlineAction,
  };
};