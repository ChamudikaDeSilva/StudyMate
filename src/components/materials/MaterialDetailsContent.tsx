import React from 'react';

import { Text, View } from 'react-native';

import { FileImage, FileText, Trash2 } from 'lucide-react-native';

import { Material } from '../../domain/models/Material';
import { colors } from '../../constants/colors';
import { materialPresentation } from '../../constants/materialPresentation';

import AiSummaryActionCard from '../ai/AiSummaryActionCard';

import FlashcardsActionCard from '../ai/FlashcardsActionCard';

import QuizActionCard from '../ai/QuizActionCard';

import AppButton from '../common/AppButton';

import SectionCard from '../common/SectionCard';

import MaterialEditForm from './MaterialEditForm';

import MaterialFileActionCard from './MaterialFileActionCard';

import MaterialTypeBanner from './MaterialTypeBanner';

interface MaterialDetailsContentProps {
  material: Material;

  editing: boolean;

  title: string;

  content: string;

  busy: boolean;

  isUpdating: boolean;

  isDeleting: boolean;

  onTitleChange: (value: string) => void;

  onContentChange: (value: string) => void;

  onCancelEdit: () => void;

  onSave: () => void;

  onPreviewPdf: () => void;

  onPreviewImage: () => void;

  onGenerateSummary: () => void;

  aiSummaryDisabled?: boolean;

  onGenerateFlashcards: () => void;

  aiFlashcardsDisabled?: boolean;

  onOpenQuiz: () => void;

  aiQuizDisabled?: boolean;

  onDelete: () => void;
}

const MaterialDetailsContent = ({
  material,

  editing,
  title,
  content,

  busy,
  isUpdating,
  isDeleting,

  onTitleChange,
  onContentChange,

  onCancelEdit,
  onSave,

  onPreviewPdf,
  onPreviewImage,

  onGenerateSummary,
  aiSummaryDisabled,

  onGenerateFlashcards,
  aiFlashcardsDisabled,

  onOpenQuiz,
  aiQuizDisabled,

  onDelete,
}: MaterialDetailsContentProps) => {
  const isPdf = material.sourceType === 'pdf';

  const isImage =
    material.sourceType === 'image' || material.sourceType === 'camera';

  //
  // Image and camera files now support permanent local storage.
  // Therefore preview must NOT be guarded by connectivity.
  //
  // ImagePreviewScreen decides:
  //
  // local copy exists -> open it
  // no local copy + online -> download and persist it
  // no local copy + offline -> show friendly unavailable state
  // =========================================================

  //
  // Opening the Summary screen is allowed offline.
  //
  // The Summary screen decides whether to use local cache,
  // FastAPI, or online Gemini generation.
  // =========================================================

  //
  // Opening the Flashcards screen is allowed offline now.
  //
  // The Flashcards screen decides whether to use local cache,
  // FastAPI, or online Gemini generation.
  //
  // Generate Again remains online-only inside the Flashcards
  // screen hook.
  // =========================================================

  return (
    <>
      <MaterialTypeBanner material={material} />

      {editing ? (
        <MaterialEditForm
          material={material}
          title={title}
          content={content}
          busy={busy}
          isUpdating={isUpdating}
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
          onCancel={onCancelEdit}
          onSave={onSave}
        />
      ) : (
        <>
          <SectionCard label="Your material" className="mb-5">
            <Text className="text-[22px] font-bold leading-8 tracking-tight text-ink">
              {material.title}
            </Text>
          </SectionCard>

          {material.sourceType === 'text' && (
            <SectionCard label="Study content" className="mb-5">
              <Text selectable className="text-[15px] leading-7 text-ink">
                {material.content}
              </Text>
            </SectionCard>
          )}

          {isPdf && (
            <MaterialFileActionCard
              label="PDF document"
              fileName={material.fileName ?? 'PDF document'}
              icon={FileText}
              color={materialPresentation.pdf.foreground}
              background={materialPresentation.pdf.background}
              actionTitle="Preview PDF"
              disabled={busy}
              onPreview={onPreviewPdf}
            />
          )}

          {isImage && (
            <MaterialFileActionCard
              label={
                material.sourceType === 'camera' ? 'Camera image' : 'Image file'
              }
              fileName={
                material.fileName ??
                (material.sourceType === 'camera'
                  ? 'Camera material'
                  : 'Image material')
              }
              icon={FileImage}
              color={materialPresentation[material.sourceType].foreground}
              background={materialPresentation[material.sourceType].background}
              actionTitle="Preview image"
              disabled={busy}
              onPreview={onPreviewImage}
            />
          )}

          <Text className="mb-1 text-xl font-bold text-ink">
            Study your way
          </Text>
          <Text className="mb-4 text-sm leading-5 text-muted">
            Review the key ideas, practice recall, or test what you know.
          </Text>

          <View className="mb-5 gap-3">
            <AiSummaryActionCard
              onPress={onGenerateSummary}
              disabled={aiSummaryDisabled || busy}
            />

            <FlashcardsActionCard
              onPress={onGenerateFlashcards}
              disabled={aiFlashcardsDisabled || busy}
            />

            <QuizActionCard
              onPress={onOpenQuiz}
              disabled={aiQuizDisabled || busy}
            />
          </View>

          <AppButton
            title="Delete material"
            icon={<Trash2 size={18} color={colors.danger} />}
            loading={isDeleting}
            tone="danger"
            variant="ghost"
            disabled={busy}
            onPress={onDelete}
          />
        </>
      )}
    </>
  );
};

export default MaterialDetailsContent;
