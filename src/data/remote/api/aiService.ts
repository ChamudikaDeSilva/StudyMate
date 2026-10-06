import {
  MaterialSummary,
  MaterialSummarySourceType,
} from '../../../domain/models/MaterialSummary';

import {
  apiRequest,
} from './apiClient';


type MaterialSummaryApiResponse = {

  material_id:
    number;

  title:
    string;

  source_type:
    MaterialSummarySourceType;

  provider:
    string;

  extracted_character_count:
    number;

  summary:
    string;

  key_points:
    string[];

  study_tips:
    string[];
};


// ============================================================
// MAPPER
// ============================================================


const mapMaterialSummary =
  (
    response:
      MaterialSummaryApiResponse,
  ): MaterialSummary => {

    return {

      materialId:
        String(
          response.material_id,
        ),

      title:
        response.title,

      sourceType:
        response.source_type,

      provider:
        response.provider,

      extractedCharacterCount:
        response
          .extracted_character_count,

      summary:
        response.summary,

      keyPoints:
        response.key_points,

      studyTips:
        response.study_tips,
    };
  };


// ============================================================
// CHECK WHETHER GET FAILED BECAUSE NO SUMMARY EXISTS
//
// We deliberately check the backend message rather than
// blindly treating every 404/network error as "not generated".
//
// This prevents a JWT/network/server problem from causing
// an unnecessary Gemini request.
// ============================================================


const isMissingSummaryError =
  (
    error:
      unknown,
  ): boolean => {

    if (
      !(
        error
        instanceof Error
      )
    ) {

      return false;
    }


    const message = (
      error.message
      .toLowerCase()
    );


    return (
      message.includes(
        'no saved summary exists'
      )
      ||
      message.includes(
        'no saved summary'
      )
    );
  };


// ============================================================
// GET SAVED SUMMARY
// ============================================================


export const getSavedMaterialSummary =
  async (
    materialId:
      string | number,
  ): Promise<
    MaterialSummary | null
  > => {

    try {

      const response =
        await apiRequest<
          MaterialSummaryApiResponse
        >(
          `/ai/materials/${materialId}/summary`,
          {
            method:
              'GET',

            authenticated:
              true,
          },
        );


      return (
        mapMaterialSummary(
          response,
        )
      );


    } catch (
      error
    ) {

      // ======================================================
      // SUMMARY HAS NEVER BEEN GENERATED
      // ======================================================

      if (
        isMissingSummaryError(
          error
        )
      ) {

        return null;
      }


      // ======================================================
      // REAL FAILURE
      //
      // Examples:
      // - JWT expired
      // - Backend unavailable
      // - Material missing
      // - Network error
      // ======================================================

      throw error;
    }
  };


// ============================================================
// GENERATE / REGENERATE SUMMARY
// ============================================================


export const generateMaterialSummary =
  async (
    materialId:
      string | number,
  ): Promise<
    MaterialSummary
  > => {

    const response =
      await apiRequest<
        MaterialSummaryApiResponse
      >(
        `/ai/materials/${materialId}/summary`,
        {
          method:
            'POST',

          authenticated:
            true,
        },
      );


    return (
      mapMaterialSummary(
        response,
      )
    );
  };