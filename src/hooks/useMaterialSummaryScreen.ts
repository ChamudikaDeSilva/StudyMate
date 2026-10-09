import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useMaterialSummary,
} from './useMaterialSummary';

import {
  useNetwork,
} from './useNetwork';

import {
  useOnlineGuard,
} from './useOnlineGuard';


interface UseMaterialSummaryScreenParams {

  materialId:
    string;
}


export const useMaterialSummaryScreen = ({
  materialId,
}: UseMaterialSummaryScreenParams) => {

  const {

    summary,

    loading,

    generating,

    error,

    loadCached,

    loadSaved,

    generate,

    clearError,

    clear,

  } = useMaterialSummary();


  const {
    isOnline,

    initialized:
      networkInitialized,

  } = useNetwork();


  const {
    runOnlineAction,
  } = useOnlineGuard();


  const [
    screenError,
    setScreenError,
  ] = useState<
    string | null
  >(
    null,
  );


  const [
    initializing,
    setInitializing,
  ] = useState(
    true,
  );


  const initialRequestStarted =
    useRef(
      false,
    );


  // =========================================================
  // GENERATE / REGENERATE
  // =========================================================
  //
  // Opening a cached Summary is allowed offline.
  //
  // Gemini generation remains online-only.
  // =========================================================

  const generateSummary =
    useCallback(
      () => {

        runOnlineAction(
          'AI Summary',
          async () => {

            setScreenError(
              null,
            );


            clearError();


            try {

              await generate(
                materialId,
              );


            } catch {

              /*
               * useMaterialSummary already stores
               * the correct API error state.
               */
            }
          },
        );

      },
      [
        clearError,
        generate,
        materialId,
        runOnlineAction,
      ],
    );


  // =========================================================
  // INITIAL LOAD
  // =========================================================
  //
  // 1. Read local cache first.
  //
  // 2. If offline:
  //      cache exists -> display it
  //      no cache -> show friendly offline message
  //
  // 3. If online:
  //      GET latest saved summary from FastAPI
  //
  // 4. If no saved summary exists:
  //      generate once using Gemini
  //
  // Successful GET/POST results refresh the local cache.
  // =========================================================

  const initializeSummary =
    useCallback(
      async () => {

        if (
          !networkInitialized
        ) {

          return;
        }


        let cachedSummaryFound =
          false;


        try {

          setInitializing(
            true,
          );


          setScreenError(
            null,
          );


          clearError();


          // ==================================================
          // STEP 1
          // LOCAL CACHE FIRST
          // ==================================================

          const cachedSummary =
            await loadCached(
              materialId,
            );


          cachedSummaryFound =
            Boolean(
              cachedSummary,
            );


          // ==================================================
          // STEP 2
          // OFFLINE
          // ==================================================

          if (
            !isOnline
          ) {

            if (
              !cachedSummaryFound
            ) {

              setScreenError(
                'No cached AI summary is available offline. '
                + 'Connect to the internet and open this '
                + 'summary once to save an offline copy.',
              );
            }


            return;
          }


          // ==================================================
          // STEP 3
          // CHECK FASTAPI DATABASE
          // ==================================================

          const savedSummary =
            await loadSaved(
              materialId,
            );


          // ==================================================
          // STEP 4
          // FOUND IN DATABASE
          // ==================================================

          if (
            savedSummary
          ) {

            return;
          }


          // ==================================================
          // STEP 5
          // NO SAVED SUMMARY
          // ==================================================

          await generate(
            materialId,
          );


        } catch {

          /*
           * If the online GET fails, do not automatically call
           * Gemini as a fallback.
           *
           * If a local cached summary was already loaded, it
           * remains visible.
           */

        } finally {

          setInitializing(
            false,
          );
        }

      },
      [
        clearError,
        generate,
        isOnline,
        loadCached,
        loadSaved,
        materialId,
        networkInitialized,
      ],
    );


  // =========================================================
  // INITIAL EFFECT
  // =========================================================
  //
  // Wait until NetInfo has initialized before marking the
  // request as started. This avoids locking the screen in an
  // unknown network state.
  // =========================================================

  useEffect(
    () => {

      if (
        !networkInitialized
      ) {

        return;
      }


      if (
        initialRequestStarted
          .current
      ) {

        return;
      }


      initialRequestStarted
        .current =
          true;


      void initializeSummary();


    },
    [
      initializeSummary,
      networkInitialized,
    ],
  );


  // =========================================================
  // RETRY
  // =========================================================

  const retry =
    useCallback(
      async () => {

        setScreenError(
          null,
        );


        clearError();


        await initializeSummary();

      },
      [
        clearError,
        initializeSummary,
      ],
    );


  return {

    summary,

    initializing,

    loading,
    generating,

    busy:
      initializing
      ||
      loading
      ||
      generating,

    error:
      screenError
      ??
      error,

    generateSummary,
    retry,
    clear,
  };
};
