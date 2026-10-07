import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import NetInfo, {
  NetInfoState,
} from '@react-native-community/netinfo';


export interface NetworkContextValue {

  isConnected:
    boolean;

  isInternetReachable:
    boolean;

  isOnline:
    boolean;

  connectionType:
    string;

  initialized:
    boolean;
}


export const NetworkContext =
  createContext<
    NetworkContextValue | undefined
  >(
    undefined,
  );


interface Props {

  children:
    ReactNode;
}


export const NetworkProvider = ({
  children,
}: Props) => {

  const [
    initialized,
    setInitialized,
  ] = useState(
    false,
  );


  const [
    state,
    setState,
  ] = useState<
    NetInfoState | null
  >(
    null,
  );


  // =========================================================
  // NETWORK LISTENER
  // =========================================================

  useEffect(
    () => {

      const unsubscribe =
        NetInfo.addEventListener(
          networkState => {

            setState(
              networkState,
            );


            setInitialized(
              true,
            );
          },
        );


      return () => {

        unsubscribe();
      };

    },
    [],
  );


  // =========================================================
  // DERIVED STATE
  // =========================================================

  const value =
    useMemo<
      NetworkContextValue
    >(
      () => {

        const isConnected =
          state?.isConnected
          ??
          false;


        /*
         * NetInfo may temporarily report
         * isInternetReachable = null while
         * determining reachability.
         *
         * If the device is connected and
         * reachability is not explicitly false,
         * treat it as online.
         */

        const isInternetReachable =
          state?.isInternetReachable
          !==
          false;


        const isOnline =
          isConnected
          &&
          isInternetReachable;


        return {

          isConnected,

          isInternetReachable,

          isOnline,

          connectionType:
            state?.type
            ??
            'unknown',

          initialized,
        };

      },
      [
        state,
        initialized,
      ],
    );


  return (

    <NetworkContext.Provider
      value={
        value
      }>

      {children}

    </NetworkContext.Provider>
  );
};