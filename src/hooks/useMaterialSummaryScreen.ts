import {
  useCallback,
  useEffect,
  useRef,
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
    generating,
    error,
    generate,
    clear,
  } = useMaterialSummary();


  // =========================================================
  // INITIAL REQUEST GUARD
  // =========================================================

  const initialRequestStarted =
    useRef(
      false,
    );


  // =========================================================
  // GENERATE
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
           * Error state is already
           * handled by useMaterialSummary.
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
  // =========================================================

  useEffect(
    () => {

      if (
        initialRequestStarted.current
      ) {

        return;
      }


      initialRequestStarted.current =
        true;


      void generateSummary();

    },
    [
      generateSummary,
    ],
  );


  // =========================================================
  // RETURN
  // =========================================================

  return {
    summary,

    generating,

    error,

    generateSummary,

    clear,
  };
};