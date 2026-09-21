import {
  Material,
  MaterialSourceType,
} from '../models/Material';

export interface CreateMaterialInput {
  userId: string;
  subjectId: string;

  title: string;

  sourceType: MaterialSourceType;

  content?: string;

  fileName?: string;
  fileUrl?: string;
}

export interface UpdateMaterialInput {
  title: string;

  content?: string;

  fileName?: string;
  fileUrl?: string;
}

export interface MaterialRepository {
  getMaterials(
    userId: string,
    subjectId: string,
  ): Promise<Material[]>;

  createMaterial(
    input: CreateMaterialInput,
  ): Promise<Material>;

  updateMaterial(
    materialId: string,
    input: UpdateMaterialInput,
  ): Promise<void>;

  deleteMaterial(
    materialId: string,
  ): Promise<void>;
}