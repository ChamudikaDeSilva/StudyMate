import {useCallback, useEffect, useMemo, useState} from 'react';
import {Material} from '../domain/models/Material';
import {MaterialApiRepositoryImpl} from '../data/repositories/MaterialApiRepositoryImpl';
import {useAuth} from './useAuth';

export const useMaterials = (subjectId: string) => {
  const {user} = useAuth();
  const repository = useMemo(() => new MaterialApiRepositoryImpl(), []);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingMaterialId, setUpdatingMaterialId] = useState<string | null>(null);
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = user ? String(user.id) : null;

  const loadMaterials = useCallback(async () => {
    if (!userId) {
      setMaterials([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMaterials(await repository.getMaterials(userId, subjectId));
    } catch (loadError) {
      console.error('Load materials error:', loadError);
      setError(
        loadError instanceof Error ? loadError.message : 'Unable to load materials.',
      );
    } finally {
      setLoading(false);
    }
  }, [repository, subjectId, userId]);

  useEffect(() => {
    void loadMaterials();
  }, [loadMaterials]);

  const addMaterialToState = useCallback((material: Material) => {
    setMaterials(current => [material, ...current]);
  }, []);

  const createTextMaterial = useCallback(
    async (title: string, content: string) => {
      if (!userId) throw new Error('You must be logged in.');
      try {
        setCreating(true);
        const material = await repository.createMaterial({
          userId,
          subjectId,
          title,
          sourceType: 'text',
          content,
        });
        addMaterialToState(material);
        return material;
      } finally {
        setCreating(false);
      }
    },
    [repository, subjectId, userId, addMaterialToState],
  );

  // Backward-compatible alias while the rest of the project is migrated.
  const createMaterial = useCallback(
    async (title: string, sourceType: 'text', content?: string) => {
      if (sourceType !== 'text' || !content) {
        throw new Error('This createMaterial() compatibility method supports text only.');
      }
      return createTextMaterial(title, content);
    },
    [createTextMaterial],
  );

  const createPdfMaterial = useCallback(
    async (title: string, fileUri: string, fileName: string, mimeType: string) => {
      if (!userId) throw new Error('You must be logged in.');
      try {
        setCreating(true);
        const material = await repository.createPdfMaterial({
          userId,
          subjectId,
          title,
          fileUri,
          fileName,
          mimeType,
        });
        addMaterialToState(material);
        return material;
      } finally {
        setCreating(false);
      }
    },
    [repository, subjectId, userId, addMaterialToState],
  );

  const createImageMaterial = useCallback(
    async (title: string, fileUri: string, fileName: string, mimeType: string) => {
      if (!userId) throw new Error('You must be logged in.');
      try {
        setCreating(true);
        const material = await repository.createImageMaterial({
          userId,
          subjectId,
          title,
          fileUri,
          fileName,
          mimeType,
        });
        addMaterialToState(material);
        return material;
      } finally {
        setCreating(false);
      }
    },
    [repository, subjectId, userId, addMaterialToState],
  );

  const updateTextMaterial = useCallback(
    async (materialId: string, title: string, content: string) => {
      try {
        setUpdatingMaterialId(materialId);
        await repository.updateMaterial(materialId, {title, content});
        await loadMaterials();
      } finally {
        setUpdatingMaterialId(null);
      }
    },
    [repository, loadMaterials],
  );

  // Backward-compatible alias while old screens are replaced.
  const updateMaterial = useCallback(
    async (materialId: string, title: string, content?: string) => {
      if (!content) {
        throw new Error('Text material content is required.');
      }
      return updateTextMaterial(materialId, title, content);
    },
    [updateTextMaterial],
  );

  const updateImageTitle = useCallback(
    async (materialId: string, title: string) => {
      try {
        setUpdatingMaterialId(materialId);
        await repository.updateImageTitle(materialId, title);
        await loadMaterials();
      } finally {
        setUpdatingMaterialId(null);
      }
    },
    [repository, loadMaterials],
  );

  const deleteMaterial = useCallback(
    async (materialId: string) => {
      try {
        setDeletingMaterialId(materialId);
        await repository.deleteMaterial(materialId);
        setMaterials(current => current.filter(item => item.id !== materialId));
      } finally {
        setDeletingMaterialId(null);
      }
    },
    [repository],
  );

  return {
    materials,
    loading,
    creating,
    updatingMaterialId,
    deletingMaterialId,
    error,
    loadMaterials,
    createTextMaterial,
    createMaterial,
    createPdfMaterial,
    createImageMaterial,
    updateTextMaterial,
    updateMaterial,
    updateImageTitle,
    deleteMaterial,
  };
};
