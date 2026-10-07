export type FlashcardSourceType =
  | 'text'
  | 'pdf'
  | 'image'
  | 'camera';


export interface Flashcard {

  id:
    string;

  position:
    number;

  front:
    string;

  back:
    string;
}


export interface MaterialFlashcards {

  flashcardSetId:
    string;

  materialId:
    string;

  title:
    string;

  sourceType:
    FlashcardSourceType;

  provider:
    string;

  cardCount:
    number;

  cards:
    Flashcard[];
}