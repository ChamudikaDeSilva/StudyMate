import {
  Flashcard,
  FlashcardSourceType,
  MaterialFlashcards,
} from '../../../domain/models/MaterialFlashcards';

import {
  apiRequest,
} from './apiClient';


type FlashcardApiItem = {

  id:
    number;

  position:
    number;

  front:
    string;

  back:
    string;
};


type MaterialFlashcardsApiResponse = {

  flashcard_set_id:
    number;

  material_id:
    number;

  title:
    string;

  source_type:
    FlashcardSourceType;

  provider:
    string;

  card_count:
    number;

  cards:
    FlashcardApiItem[];
};


// ============================================================
// MAP CARD
// ============================================================


const mapFlashcard =
  (
    item:
      FlashcardApiItem,
  ): Flashcard => {

    return {

      id:
        String(
          item.id,
        ),

      position:
        item.position,

      front:
        item.front,

      back:
        item.back,
    };
  };


// ============================================================
// MAP DECK
// ============================================================


const mapMaterialFlashcards =
  (
    response:
      MaterialFlashcardsApiResponse,
  ): MaterialFlashcards => {

    return {

      flashcardSetId:
        String(
          response.flashcard_set_id,
        ),

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

      cardCount:
        response.card_count,

      cards:
        response.cards.map(
          mapFlashcard,
        ),
    };
  };


// ============================================================
// CHECK MISSING SAVED DECK
// ============================================================


const isMissingFlashcardsError =
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


    const message =
      error.message
        .toLowerCase();


    return (
      message.includes(
        'no saved flashcards exist'
      )
      ||
      message.includes(
        'no saved flashcards'
      )
    );
  };


// ============================================================
// GET SAVED FLASHCARDS
// ============================================================


export const getSavedMaterialFlashcards =
  async (
    materialId:
      string | number,
  ): Promise<
    MaterialFlashcards | null
  > => {

    try {

      const response =
        await apiRequest<
          MaterialFlashcardsApiResponse
        >(
          `/ai/materials/${materialId}/flashcards`,
          {
            method:
              'GET',

            authenticated:
              true,
          },
        );


      return (
        mapMaterialFlashcards(
          response,
        )
      );


    } catch (
      error
    ) {

      // ======================================================
      // NO DECK YET
      // ======================================================

      if (
        isMissingFlashcardsError(
          error
        )
      ) {

        return null;
      }


      // ======================================================
      // REAL ERROR
      //
      // 401 / network / server / material missing
      // must NOT cause an automatic Gemini call.
      // ======================================================

      throw error;
    }
  };


// ============================================================
// GENERATE / REGENERATE
// ============================================================


export const generateMaterialFlashcards =
  async (
    materialId:
      string | number,

    count:
      number = 8,
  ): Promise<
    MaterialFlashcards
  > => {

    const response =
      await apiRequest<
        MaterialFlashcardsApiResponse
      >(
        `/ai/materials/${materialId}/flashcards?count=${count}`,
        {
          method:
            'POST',

          authenticated:
            true,
        },
      );


    return (
      mapMaterialFlashcards(
        response,
      )
    );
  };