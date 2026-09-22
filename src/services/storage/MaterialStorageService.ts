import {
  deleteObject,
  getDownloadURL,
  getStorage,
  putFile,
  ref,
} from '@react-native-firebase/storage';

const storage =
  getStorage();

const sanitizeFileName = (
  fileName: string,
) => {
  return fileName
    .trim()
    .replace(
      /[^a-zA-Z0-9._-]/g,
      '_',
    );
};

const getLocalFilePath = (
  localUri: string,
) => {
  const withoutScheme =
    localUri.startsWith(
      'file://',
    )
      ? localUri.replace(
          'file://',
          '',
        )
      : localUri;

  return decodeURI(
    withoutScheme,
  );
};

export interface UploadPdfInput {
  userId: string;
  subjectId: string;
  fileName: string;
  localUri: string;
}

export interface UploadPdfResult {
  fileName: string;
  fileUrl: string;
}

export class MaterialStorageService {
  // =========================================================
  // Upload PDF
  // =========================================================

  async uploadPdf(
    input: UploadPdfInput,
  ): Promise<UploadPdfResult> {
    const safeFileName =
      sanitizeFileName(
        input.fileName,
      );

    const timestamp =
      Date.now();

    const storagePath =
      `users/${input.userId}` +
      `/subjects/${input.subjectId}` +
      `/materials/` +
      `${timestamp}_${safeFileName}`;

    const localFilePath =
      getLocalFilePath(
        input.localUri,
      );

    console.log(
      '====================================',
    );

    console.log(
      'PDF STORAGE UPLOAD',
    );

    console.log(
      'Storage path:',
      storagePath,
    );

    console.log(
      'Local URI:',
      input.localUri,
    );

    console.log(
      'Local file path:',
      localFilePath,
    );

    const storageReference =
      ref(
        storage,
        storagePath,
      );

    console.log(
      'Storage bucket:',
      storageReference.bucket,
    );

    console.log(
      'Storage full path:',
      storageReference.fullPath,
    );

    // =======================================================
    // Start upload
    // =======================================================

    const uploadTask =
      putFile(
        storageReference,
        localFilePath,
        {
          contentType:
            'application/pdf',
        },
      );

    /*
     * React Native Firebase's
     * UploadTask is Promise-like.
     *
     * Waiting here means the upload
     * has completed before we request
     * the download URL.
     */
    await uploadTask;

    const uploadSnapshot =
      uploadTask.snapshot;

    console.log(
      'PDF UPLOAD FINISHED',
    );

    console.log(
      'Upload state:',
      uploadSnapshot.state,
    );

    console.log(
      'Bytes transferred:',
      uploadSnapshot
        .bytesTransferred,
    );

    console.log(
      'Total bytes:',
      uploadSnapshot
        .totalBytes,
    );

    console.log(
      'Uploaded bucket:',
      uploadSnapshot
        .ref
        .bucket,
    );

    console.log(
      'Uploaded full path:',
      uploadSnapshot
        .ref
        .fullPath,
    );

    /*
     * IMPORTANT:
     *
     * Use the exact StorageReference
     * returned by the completed upload
     * snapshot instead of rebuilding
     * another reference.
     */
    const uploadedReference =
      uploadSnapshot.ref;

    // =======================================================
    // Get download URL
    // =======================================================

    console.log(
      'Getting download URL...',
    );

    const fileUrl =
      await getDownloadURL(
        uploadedReference,
      );

    console.log(
      'PDF DOWNLOAD URL CREATED',
    );

    console.log(
      '====================================',
    );

    return {
      fileName:
        input.fileName,

      fileUrl,
    };
  }

  // =========================================================
  // Delete uploaded file
  // =========================================================

  async deleteFile(
    fileUrl: string,
  ): Promise<void> {
    if (
      !fileUrl.trim()
    ) {
      return;
    }

    const storageReference =
      ref(
        storage,
        fileUrl,
      );

    console.log(
      'Deleting Storage file:',
      storageReference.fullPath,
    );

    await deleteObject(
      storageReference,
    );
  }
}