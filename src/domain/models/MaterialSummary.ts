export type MaterialSummarySourceType =
  | 'text'
  | 'pdf'
  | 'image'
  | 'camera';


export type MaterialAiProvider =
  | 'gemini'
  | 'openai'
  | string;


export interface MaterialSummary {
  materialId: string;

  title: string;

  sourceType:
    MaterialSummarySourceType;

  provider:
    MaterialAiProvider;

  extractedCharacterCount:
    number;

  summary: string;

  keyPoints: string[];

  studyTips: string[];
}