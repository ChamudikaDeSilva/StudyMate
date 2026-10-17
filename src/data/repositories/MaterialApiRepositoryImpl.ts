import {Material, MaterialSourceType} from '../../domain/models/Material';
import {
  CreateImageMaterialInput,
  CreateMaterialInput,
  CreatePdfMaterialInput,
  MaterialRepository,
  UpdateMaterialInput,
} from '../../domain/repositories/MaterialRepository';
import {apiRequest} from '../remote/api/apiClient';
import {uploadMultipart} from '../remote/api/multipartClient';

interface MaterialApiResponse {
  id: number;
  subject_id: number;
  title: string;
  source_type: MaterialSourceType;
  content: string | null;
  file_name: string | null;
  file_path: string | null;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

const mapMaterial = (response: MaterialApiResponse, userId: string): Material => ({
  id: String(response.id),
  userId,
  subjectId: String(response.subject_id),
  title: response.title,
  sourceType: response.source_type,
  content: response.content ?? undefined,
  fileName: response.file_name ?? undefined,
  fileUrl: undefined,
  createdAt: new Date(response.created_at).getTime(),
  updatedAt: new Date(response.updated_at).getTime(),
  syncStatus: 'synced',
});

export class MaterialApiRepositoryImpl implements MaterialRepository {
  constructor(private readonly accessToken?: string) {}

  async getMaterials(userId: string, subjectId: string): Promise<Material[]> {
    const response = await apiRequest<MaterialApiResponse[]>(
      `/subjects/${subjectId}/materials`,
      {method: 'GET', authenticated: true, accessToken: this.accessToken},
    );
    return response.map(item => mapMaterial(item, userId));
  }

  async createMaterial(input: CreateMaterialInput): Promise<Material> {
    if (input.sourceType !== 'text') {
      throw new Error('createMaterial() is reserved for text materials.');
    }

    const title = input.title.trim();
    const content = input.content?.trim();

    if (!title) throw new Error('Material title is required.');
    if (!content) throw new Error('Text material content is required.');

    const response = await apiRequest<MaterialApiResponse>(
      `/subjects/${input.subjectId}/materials/text`,
      {
        method: 'POST',
        authenticated: true,
        accessToken: this.accessToken,
        body: JSON.stringify({title, content}),
      },
    );

    return mapMaterial(response, input.userId);
  }

  async createPdfMaterial(input: CreatePdfMaterialInput): Promise<Material> {
    return this.uploadFileMaterial(input, 'pdf');
  }

  async createImageMaterial(input: CreateImageMaterialInput): Promise<Material> {
    return this.uploadFileMaterial(input, 'image');
  }

  private async uploadFileMaterial(
    input: CreatePdfMaterialInput | CreateImageMaterialInput,
    endpointType: 'pdf' | 'image',
  ): Promise<Material> {
    const title = input.title.trim();
    if (!title) throw new Error('Material title is required.');
    if (!input.fileUri) throw new Error('File URI is required.');
    if (!input.fileName) throw new Error('File name is required.');

    const response = await uploadMultipart<MaterialApiResponse>({
      endpoint: `/subjects/${input.subjectId}/materials/${endpointType}`,
      fields: {title},
      accessToken: this.accessToken,
      file: {
        uri: input.fileUri,
        fileName: input.fileName,
        mimeType: input.mimeType,
      },
    });

    return mapMaterial(response, input.userId);
  }

  async updateMaterial(materialId: string, input: UpdateMaterialInput): Promise<void> {
    const title = input.title.trim();
    const content = input.content?.trim();

    if (!title) throw new Error('Material title is required.');
    if (!content) throw new Error('Text material content is required.');

    await apiRequest<MaterialApiResponse>(`/materials/${materialId}`, {
      method: 'PUT',
      authenticated: true,
      accessToken: this.accessToken,
      body: JSON.stringify({title, content}),
    });
  }

  async updateMaterialTitle(materialId: string, title: string): Promise<void> {
    const cleanTitle = title.trim();
    if (!cleanTitle) throw new Error('Material title is required.');

    await apiRequest<MaterialApiResponse>(`/materials/${materialId}/title`, {
      method: 'PATCH',
      authenticated: true,
      accessToken: this.accessToken,
      body: JSON.stringify({title: cleanTitle}),
    });
  }

  async updateImageTitle(materialId: string, title: string): Promise<void> {
    return this.updateMaterialTitle(materialId, title);
  }

  async deleteMaterial(materialId: string): Promise<void> {
    await apiRequest<void>(`/materials/${materialId}`, {
      method: 'DELETE',
      authenticated: true,
      accessToken: this.accessToken,
    });
  }
}
