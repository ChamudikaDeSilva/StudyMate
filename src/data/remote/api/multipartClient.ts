import ReactNativeBlobUtil from 'react-native-blob-util';
import {API_CONFIG} from '../../../config/api';
import {getAccessToken} from '../../local/tokenStorage';
import {ApiError} from './apiClient';

export interface MultipartFile {
  uri: string;
  fileName: string;
  mimeType: string;
}

interface MultipartUploadOptions {
  endpoint: string;
  fields: Record<string, string>;
  file: MultipartFile;
  accessToken?: string;
}

const normalizeFilePath = (uri: string): string => {
  let filePath = uri;

  if (filePath.startsWith('file://')) {
    filePath = filePath.replace('file://', '');
  }

  return filePath.startsWith('content://') ? filePath : decodeURI(filePath);
};

export const uploadMultipart = async <T>({
  endpoint,
  fields,
  file,
  accessToken,
}: MultipartUploadOptions): Promise<T> => {
  const token = accessToken === undefined ? await getAccessToken() : accessToken;
  if (!token) {
    throw new ApiError('Authentication token is missing.', 401);
  }

  const response = await ReactNativeBlobUtil.fetch(
    'POST',
    `${API_CONFIG.baseUrl}${endpoint}`,
    {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
    [
      ...Object.entries(fields).map(([name, data]) => ({name, data})),
      {
        name: 'file',
        filename: file.fileName,
        type: file.mimeType,
        data: ReactNativeBlobUtil.wrap(normalizeFilePath(file.uri)),
      },
    ],
  );

  const status = response.info().status;
  const responseText = await response.text();

  if (status < 200 || status >= 300) {
    let message = 'Unable to upload material.';

    if (responseText.trim()) {
      try {
        const body = JSON.parse(responseText);
        if (typeof body.detail === 'string') {
          message = body.detail;
        }
      } catch {
        message = responseText;
      }
    }

    throw new ApiError(message, status);
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error('File uploaded but the server returned an invalid response.');
  }
};
