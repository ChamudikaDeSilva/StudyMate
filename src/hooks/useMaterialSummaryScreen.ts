import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useMaterialSummary,
} from './useMaterialSummary';


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

    loadSaved,

    generate,

    clear,

  } = useMaterialSummary();


  // =========================================================
  // INITIAL SCREEN STATE
  //
  // Remains true while:
  //
  // GET saved summary
  //      ↓
  // possibly POST new summary
  //
  // This prevents UI flicker between the two operations.
  // =========================================================

  const [
    initializing,
    setInitializing,
  ] = useState(
    true,
  );


  // =========================================================
  // INITIAL REQUEST GUARD
  //
  // Protects against duplicate calls caused by React
  // development behavior / re-renders.
  // =========================================================

  const initialRequestStarted =
    useRef(
      false,
    );


  // =========================================================
  // GENERATE / REGENERATE
  // =========================================================

  const generateSummary =
    useCallback(
      async () => {

        try {

          await generate(
            materialId,
          );


        } catch {

          /*
           * useMaterialSummary already stores
           * the correct error state.
           */
        }

      },
      [
        generate,
        materialId,
      ],
    );


  // =========================================================
  // INITIAL LOAD
  //
  // 1. Try saved summary.
  // 2. If none exists, generate once.
  // 3. If GET fails for a real reason, do NOT generate.
  // =========================================================

  const initializeSummary =
    useCallback(
      async () => {

        try {

          setInitializing(
            true,
          );


          // ==================================================
          // STEP 1
          // CHECK DATABASE
          // ==================================================

          const savedSummary =
            await loadSaved(
              materialId,
            );


          // ==================================================
          // STEP 2
          // FOUND IN DB
          //
          // Stop here. Gemini is NOT called.
          // ==================================================

          if (
            savedSummary
          ) {

            return;
          }


          // ==================================================
          // STEP 3
          // NO SAVED SUMMARY
          //
          // This is the only automatic path that calls
          // Gemini.
          // ==================================================

          await generate(
            materialId,
          );


        } catch {

          /*
           * IMPORTANT:
           *
           * If GET failed because of:
           *
           * - authentication
           * - network
           * - backend failure
           * - missing material
           *
           * loadSaved throws and execution lands here.
           *
           * We deliberately DO NOT call Gemini.
           */

        } finally {

          setInitializing(
            false,
          );
        }

      },
      [
        generate,
        loadSaved,
        materialId,
      ],
    );


  // =========================================================
  // INITIAL EFFECT
  // =========================================================

  useEffect(
    () => {

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
    ],
  );


  // =========================================================
  // RETRY INITIAL FLOW
  //
  // Used if the initial GET/generation fails.
  // =========================================================

  const retry =
    useCallback(
      async () => {

        await initializeSummary();

      },
      [
        initializeSummary,
      ],
    );


  // =========================================================
  // RETURN
  // =========================================================

  return {

    // Data
    summary,

    // Initial DB / generate state
    initializing,

    // Detailed states
    loading,
    generating,

    // Combined initial busy state
    busy:
      initializing
      ||
      loading
      ||
      generating,

    // Error
    error,

    // Actions
    generateSummary,
    retry,
    clear,
  };
};