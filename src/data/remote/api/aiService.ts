import {
  MaterialSummary,
  MaterialSummarySourceType,
} from '../../../domain/models/MaterialSummary';

import {
  apiRequest,
} from './apiClient';


type MaterialSummaryApiResponse = {
  material_id: number;

  title: string;

  source_type:
    MaterialSummarySourceType;

  provider: string;

  extracted_character_count:
    number;

  summary: string;

  key_points: string[];

  study_tips: string[];
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
// GENERATE SUMMARY
// ============================================================


export const generateMaterialSummary =
  async (
    materialId:
      string | number,
  ): Promise<MaterialSummary> => {

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


    return mapMaterialSummary(
      response,
    );
  };