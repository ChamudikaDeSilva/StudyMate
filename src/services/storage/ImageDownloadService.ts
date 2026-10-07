import ReactNativeBlobUtil
  from 'react-native-blob-util';

import {
  API_CONFIG,
} from '../../config/api';

import {
  getAccessToken,
} from '../../data/local/tokenStorage';


export class ImageDownloadService {

  async downloadImage(
    materialId: string,
  ): Promise<string> {

    const token =
      await getAccessToken();


    if (!token) {

      throw new Error(
        'Authentication token is missing.',
      );
    }


    const url =
      `${API_CONFIG.baseUrl}`
      + `/materials/${materialId}/file`;


    const response =
      await ReactNativeBlobUtil
        .config({
          fileCache:
            true,
        })
        .fetch(
          'GET',

          url,

          {
            Authorization:
              `Bearer ${token}`,
          },
        );


    const status =
      response
        .info()
        .status;


    if (
      status < 200 ||
      status >= 300
    ) {

      try {

        await ReactNativeBlobUtil.fs.unlink(
          response.path(),
        );

      } catch {
        // ignore cleanup errors
      }


      throw new Error(
        `Unable to download image. Server returned ${status}.`,
      );
    }


    return (
      `file://${response.path()}`
    );
  }


  async deleteCachedImage(
    uri: string,
  ): Promise<void> {

    try {

      const path =
        uri.startsWith(
          'file://',
        )
          ? uri.replace(
              'file://',
              '',
            )
          : uri;


      const exists =
        await ReactNativeBlobUtil.fs.exists(
          path,
        );


      if (exists) {

        await ReactNativeBlobUtil.fs.unlink(
          path,
        );
      }

    } catch (
      cleanupError
    ) {

      console.warn(
        'Unable to clean cached image:',
        cleanupError,
      );
    }
  }
}