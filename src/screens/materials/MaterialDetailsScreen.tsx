import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FileImage, FileText, Pencil, Save, Trash2, X} from 'lucide-react-native';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import ScreenHeader from '../../components/common/ScreenHeader';
import ScreenState from '../../components/common/ScreenState';
import SectionCard from '../../components/common/SectionCard';
import MaterialFileActionCard from '../../components/materials/MaterialFileActionCard';
import MaterialTypeBanner from '../../components/materials/MaterialTypeBanner';
import {useMaterials} from '../../hooks/useMaterials';
import {SubjectsStackParamList} from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<SubjectsStackParamList, 'MaterialDetails'>;

const MaterialDetailsScreen = ({navigation, route}: Props) => {
  const {materialId, subjectId, subjectName} = route.params;
  const {
    materials,
    loading,
    updatingMaterialId,
    deletingMaterialId,
    error,
    loadMaterials,
    updateTextMaterial,
    updateImageTitle,
    deleteMaterial,
  } = useMaterials(subjectId);

  const material = useMemo(
    () => materials.find(item => item.id === materialId),
    [materials, materialId],
  );

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isUpdating = updatingMaterialId === materialId;
  const isDeleting = deletingMaterialId === materialId;
  const busy = isUpdating || isDeleting;

  useEffect(() => {
    if (!material) return;
    setTitle(material.title);
    setContent(material.content ?? '');
  }, [material]);

  const canEdit = material?.sourceType === 'text' || material?.sourceType === 'image';

  const startEditing = () => {
    if (!material || busy || !canEdit) return;
    setTitle(material.title);
    setContent(material.content ?? '');
    setEditing(true);
  };

  const cancelEditing = () => {
    if (!material || busy) return;
    setTitle(material.title);
    setContent(material.content ?? '');
    setEditing(false);
  };

  const handleSave = async () => {
    if (!material) return;
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      Alert.alert('Title required', 'Please enter a material title.');
      return;
    }

    try {
      if (material.sourceType === 'image') {
        await updateImageTitle(material.id, cleanTitle);
        setEditing(false);
        return;
      }

      if (material.sourceType !== 'text') return;

      const cleanContent = content.trim();
      if (!cleanContent) {
        Alert.alert('Content required', 'Please enter study content.');
        return;
      }

      await updateTextMaterial(material.id, cleanTitle, cleanContent);
      setEditing(false);
    } catch (saveError) {
      Alert.alert(
        'Unable to update material',
        saveError instanceof Error ? saveError.message : 'Unable to update material.',
      );
    }
  };

  const handleDelete = () => {
    if (!material || busy) return;

    Alert.alert(
      'Delete material',
      `Are you sure you want to delete "${material.title}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMaterial(material.id);
              navigation.goBack();
            } catch (deleteError) {
              Alert.alert(
                'Unable to delete material',
                deleteError instanceof Error
                  ? deleteError.message
                  : 'Unable to delete material.',
              );
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <ScreenState loading title="Loading material" description="Preparing material details..." />
      </SafeAreaView>
    );
  }

  if (!material) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 px-6 pt-6">
          <ScreenHeader title="Material" subtitle={subjectName} onBack={() => navigation.goBack()} />
          <ScreenState
            title="Material not found"
            description={error ?? 'The material may have been removed.'}
            actionTitle="Try again"
            onAction={loadMaterials}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isPdf = material.sourceType === 'pdf';
  const isImage = material.sourceType === 'image' || material.sourceType === 'camera';

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{paddingBottom: 120}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-6">
            <ScreenHeader
              title="Material"
              subtitle={subjectName}
              onBack={() => navigation.goBack()}
              right={
                !editing && canEdit ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Edit material"
                    disabled={busy}
                    onPress={startEditing}
                    className="ml-3 h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                    <Pencil size={20} color="#4F46E5" />
                  </Pressable>
                ) : undefined
              }
            />

            <MaterialTypeBanner material={material} />

            {editing ? (
              <SectionCard>
                <AppInput
                  label="Title"
                  value={title}
                  onChangeText={setTitle}
                  editable={!busy}
                  placeholder="Material title"
                />

                {material.sourceType === 'text' && (
                  <View className="mb-5">
                    <Text className="mb-2 text-sm font-semibold text-slate-800">Content</Text>
                    <TextInput
                      value={content}
                      onChangeText={setContent}
                      editable={!busy}
                      multiline
                      textAlignVertical="top"
                      placeholder="Study content"
                      placeholderTextColor="#94A3B8"
                      className="min-h-[220px] rounded-xl border border-slate-200 bg-white px-4 py-4 text-slate-900"
                    />
                  </View>
                )}

                <View className="flex-row">
                  <AppButton
                    title="Cancel"
                    icon={<X size={18} color="#475569" />}
                    variant="outline"
                    tone="neutral"
                    disabled={busy}
                    onPress={cancelEditing}
                    className="mr-3 flex-1"
                  />
                  <AppButton
                    title="Save"
                    icon={<Save size={18} color="#FFFFFF" />}
                    loading={isUpdating}
                    disabled={!title.trim()}
                    onPress={handleSave}
                    className="flex-1"
                  />
                </View>
              </SectionCard>
            ) : (
              <>
                <SectionCard label="Title" className="mb-4">
                  <Text className="text-base font-bold text-slate-900">{material.title}</Text>
                </SectionCard>

                {material.sourceType === 'text' && (
                  <SectionCard label="Study content" className="mb-4">
                    <Text className="leading-6 text-slate-700">{material.content}</Text>
                  </SectionCard>
                )}

                {isPdf && (
                  <MaterialFileActionCard
                    label="PDF document"
                    fileName={material.fileName ?? 'PDF document'}
                    icon={FileText}
                    color="#E11D48"
                    background="#FFF1F2"
                    actionTitle="Preview PDF"
                    tone="danger"
                    onPreview={() =>
                      navigation.navigate('PdfPreview', {
                        materialId: material.id,
                        subjectId,
                        subjectName,
                        title: material.title,
                      })
                    }
                  />
                )}

                {isImage && (
                  <MaterialFileActionCard
                    label="Image file"
                    fileName={material.fileName ?? 'Image material'}
                    icon={FileImage}
                    color="#0284C7"
                    background="#E0F2FE"
                    actionTitle="Preview image"
                    tone="info"
                    onPreview={() =>
                      navigation.navigate('ImagePreview', {
                        materialId: material.id,
                        subjectId,
                        subjectName,
                        title: material.title,
                      })
                    }
                  />
                )}

                <AppButton
                  title="Delete material"
                  icon={
                    isDeleting ? (
                      <ActivityIndicator color="#DC2626" />
                    ) : (
                      <Trash2 size={18} color="#DC2626" />
                    )
                  }
                  tone="danger"
                  variant="soft"
                  disabled={busy}
                  onPress={handleDelete}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MaterialDetailsScreen;
