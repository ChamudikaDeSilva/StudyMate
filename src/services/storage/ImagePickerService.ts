import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

import type {
  Asset,
  CameraOptions,
  ImageLibraryOptions,
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

  // =========================================================
  // Convert picker Asset -> app model
  // =========================================================

  private mapAsset(
    asset: Asset,
    source:
      'gallery' | 'camera',
  ): PickedImage {

    if (!asset.uri) {

      throw new Error(
        'The selected image does not contain a valid file URI.',
      );
    }


    const mimeType =
      asset.type ??
      'image/jpeg';


    let extension =
      'jpg';


    if (
      mimeType ===
      'image/png'
    ) {
      extension =
        'png';
    }


    if (
      mimeType ===
      'image/webp'
    ) {
      extension =
        'webp';
    }


    const generatedFileName =
      source ===
      'camera'
        ? (
            `camera-${Date.now()}.${extension}`
          )
        : (
            `image-${Date.now()}.${extension}`
          );


    return {
      localUri:
        asset.uri,

      fileName:
        asset.fileName ??
        generatedFileName,

      mimeType,

      size:
        asset.fileSize,

      width:
        asset.width,

      height:
        asset.height,
    };
  }


  // =========================================================
  // Gallery
  // =========================================================

  async pickImage():
    Promise<
      PickedImage | null
    > {

    const options:
      ImageLibraryOptions = {

      mediaType:
        'photo',

      selectionLimit:
        1,

      quality:
        1,

      includeBase64:
        false,
    };


    const response =
      await launchImageLibrary(
        options,
      );


    if (
      response.didCancel
    ) {

      return null;
    }


    if (
      response.errorCode
    ) {

      throw new Error(
        response.errorMessage ??
        'Unable to open image library.',
      );
    }


    const asset =
      response.assets?.[0];


    if (!asset) {

      throw new Error(
        'No image was selected.',
      );
    }


    return this.mapAsset(
      asset,
      'gallery',
    );
  }


  // =========================================================
  // Camera
  // =========================================================

  async captureImage():
    Promise<
      PickedImage | null
    > {

    const options:
      CameraOptions = {

      mediaType:
        'photo',

      cameraType:
        'back',

      quality:
        0.9,

      saveToPhotos:
        false,

      includeBase64:
        false,
    };


    const response =
      await launchCamera(
        options,
      );


    if (
      response.didCancel
    ) {

      return null;
    }


    if (
      response.errorCode
    ) {

      throw new Error(
        response.errorMessage ??
        'Unable to open the camera.',
      );
    }


    const asset =
      response.assets?.[0];


    if (!asset) {

      throw new Error(
        'The camera did not return a captured image.',
      );
    }


    return this.mapAsset(
      asset,
      'camera',
    );
  }
}