import ReactNativeBlobUtil from 'react-native-blob-util';
import {API_CONFIG} from '../../config/api';
import {getAccessToken} from '../../data/local/tokenStorage';
import {ApiError} from '../../data/remote/api/apiClient';

export class MaterialFileDownloadService {
  async download(materialId: string, extension?: string): Promise<string> {
    if (!materialId) {
      throw new Error('Material ID is required.');
    }

    const token = await getAccessToken();
    if (!token) {
      throw new ApiError('Authentication token is missing.', 401);
    }

    const response = await ReactNativeBlobUtil.config({
      fileCache: true,
      ...(extension ? {appendExt: extension} : {}),
    }).fetch(
      'GET',
      `${API_CONFIG.baseUrl}/materials/${materialId}/file`,
      {
        Authorization: `Bearer ${token}`,
      },
    );

    const status = response.info().status;
    const localPath = response.path();

    if (status < 200 || status >= 300) {
      await this.deletePath(localPath);

      if (status === 401) {
        throw new ApiError('Your session has expired. Please sign in again.', status);
      }
      if (status === 404) {
        throw new ApiError('The material file could not be found.', status);
      }
      throw new ApiError('Unable to download material file.', status);
    }

    if (!localPath) {
      throw new Error('The downloaded file path is unavailable.');
    }

    const exists = await ReactNativeBlobUtil.fs.exists(localPath);
    if (!exists) {
      throw new Error('The downloaded file could not be found on the device.');
    }

    return localPath.startsWith('file://') ? localPath : `file://${localPath}`;
  }

  async deleteCachedFile(fileUri?: string | null): Promise<void> {
    if (!fileUri) return;
    const filePath = fileUri.startsWith('file://')
      ? fileUri.replace('file://', '')
      : fileUri;
    await this.deletePath(filePath);
  }

  private async deletePath(path?: string): Promise<void> {
    if (!path) return;
    try {
      if (await ReactNativeBlobUtil.fs.exists(path)) {
        await ReactNativeBlobUtil.fs.unlink(path);
      }
    } catch (error) {
      console.warn('Unable to remove cached material file:', error);
    }
  }
}
