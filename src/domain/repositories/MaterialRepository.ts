import {Material, MaterialSourceType} from '../models/Material';

export interface CreateMaterialInput {
  userId: string;
  subjectId: string;
  title: string;
  sourceType: MaterialSourceType;
  content?: string;
  fileName?: string;
  fileUrl?: string;
}

export interface CreateFileMaterialInput {
  userId: string;
  subjectId: string;
  title: string;
  fileUri: string;
  fileName: string;
  mimeType: string;
}

export type CreatePdfMaterialInput = CreateFileMaterialInput;
export type CreateImageMaterialInput = CreateFileMaterialInput;

export interface UpdateMaterialInput {
  title: string;
  content?: string;
}

export interface MaterialRepository {
  getMaterials(userId: string, subjectId: string): Promise<Material[]>;

  // Current generic method is intentionally retained for compatibility.
  // Active API implementation accepts sourceType="text" here.
  createMaterial(input: CreateMaterialInput): Promise<Material>;

  createPdfMaterial(input: CreatePdfMaterialInput): Promise<Material>;
  createImageMaterial(input: CreateImageMaterialInput): Promise<Material>;

  updateMaterial(materialId: string, input: UpdateMaterialInput): Promise<void>;
  updateMaterialTitle(materialId: string, title: string): Promise<void>;
  updateImageTitle(materialId: string, title: string): Promise<void>;
  deleteMaterial(materialId: string): Promise<void>;
}
