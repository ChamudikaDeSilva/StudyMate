import ReactNativeBlobUtil
  from 'react-native-blob-util';


export type OfflineFileSourceType =
  | 'pdf'
  | 'image'
  | 'camera';


export interface PersistOfflineFileInput {

  userId:
    string;

  subjectId:
    string;

  materialId:
    string;

  sourceUri:
    string;

  fileName:
    string;

  sourceType:
    OfflineFileSourceType;
}


export interface PersistedOfflineFile {

  localPath:
    string;

  localUri:
    string;

  fileName:
    string;

  sourceType:
    OfflineFileSourceType;
}


export interface FindOfflineFileInput {

  userId:
    string;

  subjectId:
    string;

  materialId:
    string;

  fileName:
    string;

  sourceType:
    OfflineFileSourceType;
}


export class OfflineFileStorageService {


  // =========================================================
  // ROOT DIRECTORY
  // =========================================================

  private readonly rootDirectory =
    `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/learnloop/offline-files`;


  // =========================================================
  // SAFE PATH SEGMENT
  // =========================================================

  private safeSegment(
    value:
      string,
  ): string {

    return value
      .trim()
      .replace(
        /[^a-zA-Z0-9._-]/g,
        '_',
      );
  }


  // =========================================================
  // NORMALIZE FILE PATH
  // =========================================================

  private normalizeSourcePath(
    uri:
      string,
  ): string {

    if (
      uri.startsWith(
        'file://',
      )
    ) {

      return uri.replace(
        /^file:\/\//,
        '',
      );
    }


    return uri;
  }


  // =========================================================
  // FILE EXTENSION
  // =========================================================

  private getFileExtension(
    fileName:
      string,
  ): string {

    const lastDot =
      fileName.lastIndexOf(
        '.',
      );


    if (
      lastDot === -1
    ) {

      return '';
    }


    return fileName
      .substring(
        lastDot,
      )
      .toLowerCase();
  }


  // =========================================================
  // ENSURE DIRECTORY
  // =========================================================

  private async ensureDirectory(
    path:
      string,
  ): Promise<void> {

    const exists =
      await ReactNativeBlobUtil
        .fs
        .exists(
          path,
        );


    if (
      exists
    ) {

      return;
    }


    await ReactNativeBlobUtil
      .fs
      .mkdir(
        path,
      );
  }


  // =========================================================
  // BUILD DIRECTORY PATH
  // =========================================================

  private buildDirectoryPath(
    userId:
      string,

    subjectId:
      string,

    sourceType:
      OfflineFileSourceType,
  ): string {

    const safeUserId =
      this.safeSegment(
        userId,
      );


    const safeSubjectId =
      this.safeSegment(
        subjectId,
      );


    return (
      `${this.rootDirectory}`
      + `/${safeUserId}`
      + `/${safeSubjectId}`
      + `/${sourceType}`
    );
  }


  // =========================================================
  // ENSURE STORAGE DIRECTORIES
  // =========================================================

  private async ensureStorageDirectories(
    userId:
      string,

    subjectId:
      string,

    sourceType:
      OfflineFileSourceType,
  ): Promise<string> {

    const safeUserId =
      this.safeSegment(
        userId,
      );


    const safeSubjectId =
      this.safeSegment(
        subjectId,
      );


    const userDirectory =
      `${this.rootDirectory}/${safeUserId}`;


    const subjectDirectory =
      `${userDirectory}/${safeSubjectId}`;


    const typeDirectory =
      `${subjectDirectory}/${sourceType}`;


    await this.ensureDirectory(
      this.rootDirectory,
    );


    await this.ensureDirectory(
      userDirectory,
    );


    await this.ensureDirectory(
      subjectDirectory,
    );


    await this.ensureDirectory(
      typeDirectory,
    );


    return typeDirectory;
  }


  // =========================================================
  // BUILD MATERIAL FILE PATH
  // =========================================================

  private buildMaterialFilePath(
    userId:
      string,

    subjectId:
      string,

    materialId:
      string,

    fileName:
      string,

    sourceType:
      OfflineFileSourceType,
  ): string {

    const directory =
      this.buildDirectoryPath(
        userId,
        subjectId,
        sourceType,
      );


    const safeMaterialId =
      this.safeSegment(
        materialId,
      );


    const extension =
      this.getFileExtension(
        fileName,
      );


    return (
      `${directory}/${safeMaterialId}${extension}`
    );
  }


  // =========================================================
  // DELETE EXISTING FILE
  // =========================================================

  private async deleteIfExists(
    path:
      string,
  ): Promise<void> {

    const exists =
      await ReactNativeBlobUtil
        .fs
        .exists(
          path,
        );


    if (
      !exists
    ) {

      return;
    }


    await ReactNativeBlobUtil
      .fs
      .unlink(
        path,
      );
  }


  // =========================================================
  // PERSIST FILE
  // =========================================================

  async persistFile(
    input:
      PersistOfflineFileInput,
  ): Promise<PersistedOfflineFile> {

    const {
      userId,
      subjectId,
      materialId,
      sourceUri,
      fileName,
      sourceType,
    } = input;


    const sourcePath =
      this.normalizeSourcePath(
        sourceUri,
      );


    const sourceExists =
      await ReactNativeBlobUtil
        .fs
        .exists(
          sourcePath,
        );


    if (
      !sourceExists
    ) {

      throw new Error(
        'The selected file is no longer available on this device.',
      );
    }


    // ---------------------------------------------------------
    // Make sure destination folders exist
    // ---------------------------------------------------------

    await this.ensureStorageDirectories(
      userId,
      subjectId,
      sourceType,
    );


    const destinationPath =
      this.buildMaterialFilePath(
        userId,
        subjectId,
        materialId,
        fileName,
        sourceType,
      );


    // ---------------------------------------------------------
    // Replace previous offline copy
    // ---------------------------------------------------------

    await this.deleteIfExists(
      destinationPath,
    );


    // ---------------------------------------------------------
    // Copy into LearnLoop persistent storage
    // ---------------------------------------------------------

    await ReactNativeBlobUtil
      .fs
      .cp(
        sourcePath,
        destinationPath,
      );


    const copied =
      await ReactNativeBlobUtil
        .fs
        .exists(
          destinationPath,
        );


    if (
      !copied
    ) {

      throw new Error(
        'Unable to save the file for offline use.',
      );
    }


    console.log(
      '[OFFLINE FILE] File persisted',
      {
        materialId,
        sourceType,
        destinationPath,
      },
    );


    return {

      localPath:
        destinationPath,

      localUri:
        `file://${destinationPath}`,

      fileName,

      sourceType,
    };
  }


  // =========================================================
  // FIND PERSISTED FILE
  // =========================================================
  //
  // This is the important addition.
  //
  // We can rebuild the expected path using:
  //
  // userId
  // subjectId
  // materialId
  // file type
  //
  // Therefore we don't need to search the filesystem.
  //
  // =========================================================

  async getPersistedFile(
    input:
      FindOfflineFileInput,
  ): Promise<PersistedOfflineFile | null> {

    const {
      userId,
      subjectId,
      materialId,
      fileName,
      sourceType,
    } = input;


    const path =
      this.buildMaterialFilePath(
        userId,
        subjectId,
        materialId,
        fileName,
        sourceType,
      );


    const exists =
      await ReactNativeBlobUtil
        .fs
        .exists(
          path,
        );


    if (
      !exists
    ) {

      console.log(
        '[OFFLINE FILE] No persisted file found',
        {
          materialId,
          sourceType,
          path,
        },
      );


      return null;
    }


    console.log(
      '[OFFLINE FILE] Persisted file found',
      {
        materialId,
        sourceType,
        path,
      },
    );


    return {

      localPath:
        path,

      localUri:
        `file://${path}`,

      fileName,

      sourceType,
    };
  }


  // =========================================================
  // CHECK FILE
  // =========================================================

  async fileExists(
    localPathOrUri:
      string,
  ): Promise<boolean> {

    const path =
      this.normalizeSourcePath(
        localPathOrUri,
      );


    return ReactNativeBlobUtil
      .fs
      .exists(
        path,
      );
  }


  // =========================================================
  // GET LOCAL URI
  // =========================================================

  async getLocalUri(
    localPathOrUri:
      string,
  ): Promise<string | null> {

    const path =
      this.normalizeSourcePath(
        localPathOrUri,
      );


    const exists =
      await ReactNativeBlobUtil
        .fs
        .exists(
          path,
        );


    if (
      !exists
    ) {

      return null;
    }


    return `file://${path}`;
  }


  // =========================================================
  // DELETE FILE
  // =========================================================

  async deleteFile(
    localPathOrUri:
      string,
  ): Promise<void> {

    const path =
      this.normalizeSourcePath(
        localPathOrUri,
      );


    const exists =
      await ReactNativeBlobUtil
        .fs
        .exists(
          path,
        );


    if (
      !exists
    ) {

      return;
    }


    await ReactNativeBlobUtil
      .fs
      .unlink(
        path,
      );


    console.log(
      '[OFFLINE FILE] File deleted',
      {
        path,
      },
    );
  }


  // =========================================================
  // ROOT DIRECTORY
  // =========================================================

  getRootDirectory():
    string {

    return this.rootDirectory;
  }
}


export const offlineFileStorageService =
  new OfflineFileStorageService();