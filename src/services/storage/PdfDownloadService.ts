import ReactNativeBlobUtil from 'react-native-blob-util';

import {
  API_CONFIG,
} from '../../config/api';

import {
  getAccessToken,
} from '../../data/local/tokenStorage';

import {
  ApiError,
} from '../../data/remote/api/apiClient';


export class PdfDownloadService {

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  async downloadPdf(
    materialId: string,
  ): Promise<string> {

    if (!materialId) {
      throw new Error(
        'Material ID is required.',
      );
    }


    // =======================================================
    // JWT
    // =======================================================

    const token =
      await getAccessToken();


    if (!token) {
      throw new ApiError(
        'Authentication token is missing.',
        401,
      );
    }


    // =======================================================
    // Download URL
    // =======================================================

    const downloadUrl =
      `${API_CONFIG.baseUrl}/materials/${materialId}/file`;


    console.log(
      'PDF DOWNLOAD URL:',
      downloadUrl,
    );


    // =======================================================
    // Native download
    // =======================================================

    const response =
      await ReactNativeBlobUtil
        .config({
          fileCache: true,
          appendExt: 'pdf',
        })
        .fetch(
          'GET',
          downloadUrl,
          {
            Authorization:
              `Bearer ${token}`,

            Accept:
              'application/pdf',
          },
        );


    // =======================================================
    // Check HTTP status
    // =======================================================

    const status =
      response.info().status;


    if (
      status < 200 ||
      status >= 300
    ) {

      const downloadedPath =
        response.path();


      if (downloadedPath) {
        try {
          const exists =
            await ReactNativeBlobUtil
              .fs
              .exists(
                downloadedPath,
              );


          if (exists) {
            await ReactNativeBlobUtil
              .fs
              .unlink(
                downloadedPath,
              );
          }

        } catch (
          cleanupError
        ) {
          console.warn(
            'Unable to remove failed PDF download:',
            cleanupError,
          );
        }
      }


      if (status === 401) {
        throw new ApiError(
          'Your session has expired. Please sign in again.',
          status,
        );
      }


      if (status === 404) {
        throw new ApiError(
          'The PDF file could not be found.',
          status,
        );
      }


      throw new ApiError(
        'Unable to download PDF.',
        status,
      );
    }


    // =======================================================
    // Local cached file
    // =======================================================

    const localPath =
      response.path();


    if (!localPath) {
      throw new Error(
        'The downloaded PDF path is unavailable.',
      );
    }


    const exists =
      await ReactNativeBlobUtil
        .fs
        .exists(
          localPath,
        );


    if (!exists) {
      throw new Error(
        'The downloaded PDF could not be found on the device.',
      );
    }


    console.log(
      'PDF LOCAL PATH:',
      localPath,
    );


    return (
      localPath.startsWith(
        'file://',
      )
        ? localPath
        : `file://${localPath}`
    );
  }


  // =========================================================
  // DELETE TEMPORARY PDF
  // =========================================================

  async deleteCachedPdf(
    fileUri?: string | null,
  ): Promise<void> {

    if (!fileUri) {
      return;
    }


    const filePath =
      fileUri.startsWith(
        'file://',
      )
        ? fileUri.replace(
            'file://',
            '',
          )
        : fileUri;


    try {

      const exists =
        await ReactNativeBlobUtil
          .fs
          .exists(
            filePath,
          );


      if (exists) {
        await ReactNativeBlobUtil
          .fs
          .unlink(
            filePath,
          );
      }

    } catch (
      error
    ) {
      console.warn(
        'Unable to remove cached PDF:',
        error,
      );
    }
  }
}