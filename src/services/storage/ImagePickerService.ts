import {
  Asset,
  launchImageLibrary,
} from 'react-native-image-picker';


export interface PickedImage {
  localUri: string;

  fileName: string;

  mimeType: string;

  size?: number;

  width?: number;

  height?: number;
}


export class ImagePickerService {

  async pickImage():
    Promise<PickedImage | null> {

    const result =
      await launchImageLibrary({
        mediaType:
          'photo',

        selectionLimit:
          1,

        includeBase64:
          false,

        quality:
          0.9,
      });


    // =====================================================
    // User cancelled
    // =====================================================

    if (
      result.didCancel
    ) {
      return null;
    }


    // =====================================================
    // Picker error
    // =====================================================

    if (
      result.errorCode
    ) {
      throw new Error(
        result.errorMessage ||
        'Unable to select image.',
      );
    }


    const asset: Asset | undefined =
      result.assets?.[0];


    if (!asset) {
      throw new Error(
        'No image was selected.',
      );
    }


    if (!asset.uri) {
      throw new Error(
        'Selected image has no local URI.',
      );
    }


    const mimeType =
      asset.type ||
      'image/jpeg';


    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];


    if (
      !allowedTypes.includes(
        mimeType.toLowerCase(),
      )
    ) {
      throw new Error(
        'Please select a JPEG, PNG or WEBP image.',
      );
    }


    const fileName =
      asset.fileName ||
      `image-${Date.now()}.jpg`;


    return {
      localUri:
        asset.uri,

      fileName,

      mimeType,

      size:
        asset.fileSize,

      width:
        asset.width,

      height:
        asset.height,
    };
  }
}