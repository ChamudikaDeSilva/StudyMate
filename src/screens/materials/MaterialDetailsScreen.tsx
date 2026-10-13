import React, { useCallback } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { Pencil } from 'lucide-react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import ScreenHeader from '../../components/common/ScreenHeader';

import ScreenState from '../../components/common/ScreenState';
import ScreenContainer from '../../components/common/ScreenContainer';
import { colors } from '../../constants/colors';

import MaterialDetailsContent from '../../components/materials/MaterialDetailsContent';

import { useMaterialDetailsScreen } from '../../hooks/useMaterialDetailsScreen';

import { SubjectsStackParamList } from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<SubjectsStackParamList, 'MaterialDetails'>;

const MaterialDetailsScreen = ({ navigation, route }: Props) => {
  const { materialId, subjectId, subjectName } = route.params;

  const handleDeleted = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const screen = useMaterialDetailsScreen({
    materialId,
    subjectId,

    onDeleted: handleDeleted,
  });

  if (screen.loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 px-6 pt-6">
          <ScreenHeader
            eyebrow="Learning library"
            title="Material"
            subtitle={subjectName}
            onBack={() => navigation.goBack()}
          />
          <ScreenState
            loading
            title="Loading material"
            description="Preparing material details..."
          />
        </View>
      </ScreenContainer>
    );
  }

  if (!screen.material) {
    return (
      <ScreenContainer>
        <View className="flex-1 px-6 pt-6">
          <ScreenHeader
            eyebrow="Learning library"
            title="Material"
            subtitle={subjectName}
            onBack={() => navigation.goBack()}
          />

          <ScreenState
            title="Material not found"
            description={screen.error ?? 'The material may have been removed.'}
            actionTitle="Try again"
            onAction={screen.loadMaterials}
          />
        </View>
      </ScreenContainer>
    );
  }

  const material = screen.material;

  const handleGenerateSummary = () => {
    if (screen.busy) {
      return;
    }

    navigation.navigate('MaterialSummary', {
      materialId: material.id,

      subjectId,

      subjectName,

      materialTitle: material.title,
    });
  };

  const handleGenerateFlashcards = () => {
    if (screen.busy) {
      return;
    }

    navigation.navigate('MaterialFlashcards', {
      materialId: material.id,

      subjectId,

      subjectName,

      materialTitle: material.title,
    });
  };

  const handleOpenQuiz = () => {
    if (screen.busy) {
      return;
    }

    navigation.navigate('MaterialQuiz', {
      materialId: material.id,

      subjectId,

      subjectName,

      materialTitle: material.title,
    });
  };

  const handlePreviewPdf = () => {
    if (screen.busy || material.sourceType !== 'pdf') {
      return;
    }

    navigation.navigate('PdfPreview', {
      materialId: material.id,

      subjectId,

      subjectName,

      title: material.title,
    });
  };

  const handlePreviewImage = () => {
    if (
      screen.busy ||
      (material.sourceType !== 'image' && material.sourceType !== 'camera')
    ) {
      return;
    }

    navigation.navigate('ImagePreview', {
      materialId: material.id,

      subjectId,

      subjectName,

      title: material.title,
    });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[680px] self-center px-6 pt-6">
            <ScreenHeader
              eyebrow="Learning library"
              title={screen.editing ? 'Edit material' : 'Material'}
              subtitle={subjectName}
              onBack={() => navigation.goBack()}
              right={
                !screen.editing && screen.canEdit ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Edit material"
                    accessibilityState={{ disabled: screen.busy }}
                    disabled={screen.busy}
                    onPress={screen.startEditing}
                    className={`h-11 w-11 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 ${
                      screen.busy ? 'opacity-40' : 'active:opacity-60'
                    }`}
                  >
                    <Pencil size={20} color={colors.primary} />
                  </Pressable>
                ) : undefined
              }
            />

            <MaterialDetailsContent
              material={material}
              editing={screen.editing}
              title={screen.title}
              content={screen.content}
              busy={screen.busy}
              isUpdating={screen.isUpdating}
              isDeleting={screen.isDeleting}
              onTitleChange={screen.setTitle}
              onContentChange={screen.setContent}
              onCancelEdit={screen.cancelEditing}
              onSave={screen.saveMaterial}
              onDelete={screen.deleteCurrentMaterial}
              onGenerateSummary={handleGenerateSummary}
              aiSummaryDisabled={!screen.canGenerateSummary}
              onGenerateFlashcards={handleGenerateFlashcards}
              aiFlashcardsDisabled={!screen.canGenerateSummary}
              onOpenQuiz={handleOpenQuiz}
              aiQuizDisabled={!screen.canGenerateSummary}
              onPreviewPdf={handlePreviewPdf}
              onPreviewImage={handlePreviewImage}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default MaterialDetailsScreen;
