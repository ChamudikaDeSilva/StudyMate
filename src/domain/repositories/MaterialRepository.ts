import {
  Material,
  MaterialSourceType,
} from '../models/Material';


export interface CreateMaterialInput {
  userId: string;

  subjectId: string;

  title: string;

  sourceType:
    MaterialSourceType;

  content?: string;

  fileName?: string;

  fileUrl?: string;
}


export interface CreatePdfMaterialInput {
  userId: string;

  subjectId: string;

  title: string;

  fileUri: string;

  fileName: string;

  mimeType: string;
}


export interface CreateImageMaterialInput {
  userId: string;

  subjectId: string;

  title: string;

  fileUri: string;

  fileName: string;

  mimeType: string;
}


export interface UpdateMaterialInput {
  title: string;

  content?: string;
}


export interface MaterialRepository {

  getMaterials(
    userId: string,
    subjectId: string,
  ): Promise<Material[]>;


  createMaterial(
    input: CreateMaterialInput,
  ): Promise<Material>;


  createPdfMaterial(
    input: CreatePdfMaterialInput,
  ): Promise<Material>;


  createImageMaterial(
    input: CreateImageMaterialInput,
  ): Promise<Material>;


  updateMaterial(
    materialId: string,
    input: UpdateMaterialInput,
  ): Promise<void>;


  updateImageTitle(
    materialId: string,
    title: string,
  ): Promise<void>;


  deleteMaterial(
    materialId: string,
  ): Promise<void>;
}