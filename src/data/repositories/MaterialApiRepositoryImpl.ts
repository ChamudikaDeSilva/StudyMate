import ReactNativeBlobUtil
  from 'react-native-blob-util';

import {
  Material,
  MaterialSourceType,
} from '../../domain/models/Material';

import {
  CreateImageMaterialInput,
  CreateMaterialInput,
  CreatePdfMaterialInput,
  MaterialRepository,
  UpdateMaterialInput,
} from '../../domain/repositories/MaterialRepository';

import {
  API_CONFIG,
} from '../../config/api';

import {
  getAccessToken,
} from '../local/tokenStorage';

import {
  apiRequest,
  ApiError,
} from '../remote/api/apiClient';


interface MaterialApiResponse {
  id: number;

  subject_id: number;

  title: string;

  source_type:
    MaterialSourceType;

  content:
    string | null;

  file_name:
    string | null;

  file_path:
    string | null;

  mime_type:
    string | null;

  file_size:
    number | null;

  created_at:
    string;

  updated_at:
    string;
}


const mapMaterial = (
  response: MaterialApiResponse,
  userId: string,
): Material => {

  return {
    id:
      String(
        response.id,
      ),

    userId,

    subjectId:
      String(
        response.subject_id,
      ),

    title:
      response.title,

    sourceType:
      response.source_type,

    content:
      response.content ??
      undefined,

    fileName:
      response.file_name ??
      undefined,

    fileUrl:
      undefined,

    createdAt:
      new Date(
        response.created_at,
      ).getTime(),

    updatedAt:
      new Date(
        response.updated_at,
      ).getTime(),

    syncStatus:
      'synced',
  };
};


export class MaterialApiRepositoryImpl
  implements MaterialRepository {

  // =======================================================
  // GET
  // =======================================================

  async getMaterials(
    userId: string,
    subjectId: string,
  ): Promise<Material[]> {

    const response =
      await apiRequest<
        MaterialApiResponse[]
      >(
        `/subjects/${subjectId}/materials`,
        {
          method:
            'GET',

          authenticated:
            true,
        },
      );


    return response.map(
      item =>
        mapMaterial(
          item,
          userId,
        ),
    );
  }


  // =======================================================
  // CREATE TEXT
  // =======================================================

  async createMaterial(
    input: CreateMaterialInput,
  ): Promise<Material> {

    if (
      input.sourceType !==
      'text'
    ) {
      throw new Error(
        'This method supports text materials only.',
      );
    }


    const title =
      input.title.trim();


    const content =
      input.content?.trim();


    if (!title) {
      throw new Error(
        'Material title is required.',
      );
    }


    if (!content) {
      throw new Error(
        'Text material content is required.',
      );
    }


    const response =
      await apiRequest<
        MaterialApiResponse
      >(
        `/subjects/${input.subjectId}/materials/text`,
        {
          method:
            'POST',

          authenticated:
            true,

          body:
            JSON.stringify({
              title,
              content,
            }),
        },
      );


    return mapMaterial(
      response,
      input.userId,
    );
  }


  // =======================================================
  // FILE UPLOAD
  // =======================================================

  private async uploadFileMaterial(
    input: {
      userId: string;

      subjectId: string;

      title: string;

      fileUri: string;

      fileName: string;

      mimeType: string;
    },

    endpointType:
      'pdf' | 'image',
  ): Promise<Material> {

    const title =
      input.title.trim();


    if (!title) {
      throw new Error(
        'Material title is required.',
      );
    }


    if (!input.fileUri) {
      throw new Error(
        'File URI is required.',
      );
    }


    if (!input.fileName) {
      throw new Error(
        'File name is required.',
      );
    }


    const token =
      await getAccessToken();


    if (!token) {

      throw new ApiError(
        'Authentication token is missing.',
        401,
      );
    }


    let filePath =
      input.fileUri;


    if (
      filePath.startsWith(
        'file://',
      )
    ) {

      filePath =
        filePath.replace(
          'file://',
          '',
        );
    }


    if (
      !filePath.startsWith(
        'content://',
      )
    ) {

      filePath =
        decodeURI(
          filePath,
        );
    }


    const uploadUrl =
      `${API_CONFIG.baseUrl}`
      + `/subjects/${input.subjectId}`
      + `/materials/${endpointType}`;


    const response =
      await ReactNativeBlobUtil.fetch(
        'POST',

        uploadUrl,

        {
          Authorization:
            `Bearer ${token}`,

          Accept:
            'application/json',

          'Content-Type':
            'multipart/form-data',
        },

        [
          {
            name:
              'title',

            data:
              title,
          },

          {
            name:
              'file',

            filename:
              input.fileName,

            type:
              input.mimeType,

            data:
              ReactNativeBlobUtil.wrap(
                filePath,
              ),
          },
        ],
      );


    const status =
      response
        .info()
        .status;


    const responseText =
      await response.text();


    if (
      status < 200 ||
      status >= 300
    ) {

      let message =
        'Unable to upload material.';


      try {

        const body =
          JSON.parse(
            responseText,
          );


        if (
          typeof body.detail ===
          'string'
        ) {

          message =
            body.detail;
        }

      } catch {

        if (
          responseText.trim()
        ) {

          message =
            responseText;
        }
      }


      throw new ApiError(
        message,
        status,
      );
    }


    let materialResponse:
      MaterialApiResponse;


    try {

      materialResponse =
        JSON.parse(
          responseText,
        ) as MaterialApiResponse;

    } catch {

      throw new Error(
        'File uploaded but the server returned an invalid response.',
      );
    }


    return mapMaterial(
      materialResponse,
      input.userId,
    );
  }


  // =======================================================
  // CREATE PDF
  // =======================================================

  async createPdfMaterial(
    input: CreatePdfMaterialInput,
  ): Promise<Material> {

    return this.uploadFileMaterial(
      input,
      'pdf',
    );
  }


  // =======================================================
  // CREATE IMAGE
  // =======================================================

  async createImageMaterial(
    input: CreateImageMaterialInput,
  ): Promise<Material> {

    return this.uploadFileMaterial(
      input,
      'image',
    );
  }


  // =======================================================
  // UPDATE TEXT
  // =======================================================

  async updateMaterial(
    materialId: string,
    input: UpdateMaterialInput,
  ): Promise<void> {

    const title =
      input.title.trim();


    const content =
      input.content?.trim();


    if (!title) {

      throw new Error(
        'Material title is required.',
      );
    }


    if (!content) {

      throw new Error(
        'Text material content is required.',
      );
    }


    await apiRequest<
      MaterialApiResponse
    >(
      `/materials/${materialId}`,
      {
        method:
          'PUT',

        authenticated:
          true,

        body:
          JSON.stringify({
            title,
            content,
          }),
      },
    );
  }


  // =======================================================
  // UPDATE IMAGE TITLE
  // =======================================================

  async updateImageTitle(
    materialId: string,
    title: string,
  ): Promise<void> {

    const cleanTitle =
      title.trim();


    if (!cleanTitle) {

      throw new Error(
        'Material title is required.',
      );
    }


    await apiRequest<
      MaterialApiResponse
    >(
      `/materials/${materialId}/image-title`,
      {
        method:
          'PATCH',

        authenticated:
          true,

        body:
          JSON.stringify({
            title:
              cleanTitle,
          }),
      },
    );
  }


  // =======================================================
  // DELETE
  // =======================================================

  async deleteMaterial(
    materialId: string,
  ): Promise<void> {

    await apiRequest<void>(
      `/materials/${materialId}`,
      {
        method:
          'DELETE',

        authenticated:
          true,
      },
    );
  }
}