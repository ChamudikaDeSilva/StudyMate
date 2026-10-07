import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Text,
  View,
} from 'react-native';

import {
  CheckCircle2,
  WifiOff,
} from 'lucide-react-native';

import {
  useNetwork,
} from '../../hooks/useNetwork';


const OfflineStatusBanner =
  () => {

    const {
      isOnline,
      initialized,
    } = useNetwork();


    const [
      showBackOnline,
      setShowBackOnline,
    ] = useState(
      false,
    );


    const previousOnline =
      useRef<
        boolean | null
      >(
        null,
      );


    // ========================================================
    // BACK ONLINE FEEDBACK
    // ========================================================

    useEffect(
      () => {

        if (
          !initialized
        ) {

          return;
        }


        if (
          previousOnline.current ===
            false
          &&
          isOnline
        ) {

          setShowBackOnline(
            true,
          );


          const timer =
            setTimeout(
              () => {

                setShowBackOnline(
                  false,
                );

              },
              2500,
            );


          previousOnline.current =
            isOnline;


          return () => {

            clearTimeout(
              timer,
            );
          };
        }


        previousOnline.current =
          isOnline;

      },
      [
        initialized,
        isOnline,
      ],
    );


    // ========================================================
    // WAIT UNTIL NETWORK STATE IS KNOWN
    // ========================================================

    if (
      !initialized
    ) {

      return null;
    }


    // ========================================================
    // OFFLINE
    // ========================================================

    if (
      !isOnline
    ) {

      return (

        <View
          className="
            flex-row
            items-center
            justify-center
            bg-amber-500
            px-4
            py-2.5
          ">

          <WifiOff
            size={16}
            color="#FFFFFF"
          />


          <Text
            className="
              ml-2
              text-sm
              font-bold
              text-white
            ">

            You're offline — showing cached data

          </Text>

        </View>
      );
    }


    // ========================================================
    // BACK ONLINE
    // ========================================================

    if (
      showBackOnline
    ) {

      return (

        <View
          className="
            flex-row
            items-center
            justify-center
            bg-emerald-600
            px-4
            py-2.5
          ">

          <CheckCircle2
            size={16}
            color="#FFFFFF"
          />


          <Text
            className="
              ml-2
              text-sm
              font-bold
              text-white
            ">

            Back online

          </Text>

        </View>
      );
    }


    return null;
  };


export default OfflineStatusBanner;