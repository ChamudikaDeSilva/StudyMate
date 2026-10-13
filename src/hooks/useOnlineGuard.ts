import {
  useCallback,
} from 'react';

import {
  useAppAlert,
} from './useAppAlert';

import {
  useNetwork,
} from './useNetwork';


export const useOnlineGuard = () => {

  const {
    alert,
  } = useAppAlert();

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

          alert(
            'Checking connection',
            'Please wait a moment while LearnLoop checks your internet connection.',

            undefined,

            { tone: 'info', icon: 'connection' },
          );


          return false;
        }


        // -----------------------------------------------------
        // Offline
        // -----------------------------------------------------

        if (
          !isOnline
        ) {

          alert(
            'Internet connection required',
            `${featureName} needs an internet connection. Please reconnect and try again.`,

            undefined,

            { tone: 'warning', icon: 'connection' },
          );


          return false;
        }


        // -----------------------------------------------------
        // Online
        // -----------------------------------------------------

        return true;

      },
      [
        alert,
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