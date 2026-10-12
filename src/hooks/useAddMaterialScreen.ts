import {
  useCallback,
  useState,
} from 'react';

import {
  useAppAlert,
} from './useAppAlert';

import {
  MaterialSourceType,
} from '../domain/models/Material';

import {
  ImagePickerService,
  PickedImage,
} from '../services/storage/ImagePickerService';

import {
  PdfPickerService,
  PickedPdf,
} from '../services/storage/PdfPickerService';

import {
  cleanFileTitle,
  createCameraMaterialTitle,
} from '../utils/fileUtils';

import {
  useMaterials,
} from './useMaterials';


export type SelectedMaterialSource =
  MaterialSourceType | null;


interface UseAddMaterialScreenParams {
  subjectId:
    string;

  onSaved:
    () => void;
}


const MAX_PDF_SIZE =
  20 * 1024 * 1024;


const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;


const pdfPickerService =
  new PdfPickerService();


const imagePickerService =
  new ImagePickerService();


export const useAddMaterialScreen = ({
  subjectId,
  onSaved,
}: UseAddMaterialScreenParams) => {

  const {
    alert,
  } = useAppAlert();

  const {
    createTextMaterial,

    createPdfMaterial,

    createImageMaterial,

    creating,
  } = useMaterials(
    subjectId,
  );


  // =========================================================
  // SOURCE
  // =========================================================

  const [
    selectedSource,
    setSelectedSource,
  ] = useState<
    SelectedMaterialSource
  >(
    null,
  );


  // =========================================================
  // FORM
  // =========================================================

  const [
    title,
    setTitle,
  ] = useState(
    '',
  );


  const [
    content,
    setContent,
  ] = useState(
    '',
  );


  // =========================================================
  // FILES
  // =========================================================

  const [
    selectedPdf,
    setSelectedPdf,
  ] = useState<
    PickedPdf | null
  >(
    null,
  );


  const [
    selectedImage,
    setSelectedImage,
  ] = useState<
    PickedImage | null
  >(
    null,
  );


  const [
    capturedImage,
    setCapturedImage,
  ] = useState<
    PickedImage | null
  >(
    null,
  );


  // =========================================================
  // OPERATION STATE
  // =========================================================

  const [
    pickingPdf,
    setPickingPdf,
  ] = useState(
    false,
  );


  const [
    pickingImage,
    setPickingImage,
  ] = useState(
    false,
  );


  const [
    capturing,
    setCapturing,
  ] = useState(
    false,
  );


  const [
    uploading,
    setUploading,
  ] = useState(
    false,
  );


  const busy =
    creating
    ||
    pickingPdf
    ||
    pickingImage
    ||
    capturing
    ||
    uploading;


  const saving =
    creating
    ||
    uploading;


  // =========================================================
  // RESET
  // =========================================================

  const resetMaterialData =
    useCallback(
      () => {

        setTitle(
          '',
        );


        setContent(
          '',
        );


        setSelectedPdf(
          null,
        );


        setSelectedImage(
          null,
        );


        setCapturedImage(
          null,
        );

      },
      [],
    );


  // =========================================================
  // SOURCE
  // =========================================================

  const chooseSource =
    useCallback(
      (
        source:
          MaterialSourceType,
      ) => {

        if (
          busy
        ) {

          return;
        }


        resetMaterialData();


        setSelectedSource(
          source,
        );

      },
      [
        busy,
        resetMaterialData,
      ],
    );


  const selectText =
    useCallback(
      () => {

        chooseSource(
          'text',
        );

      },
      [
        chooseSource,
      ],
    );


  // =========================================================
  // PDF
  // =========================================================

  const selectPdf =
    useCallback(
      async () => {

        if (
          busy
        ) {

          return;
        }


        if (
          selectedSource !==
          'pdf'
        ) {

          resetMaterialData();


          setSelectedSource(
            'pdf',
          );
        }


        try {

          setPickingPdf(
            true,
          );


          const pdf =
            await pdfPickerService
              .pickPdf();


          if (
            !pdf
          ) {

            return;
          }


          if (
            pdf.size !==
              undefined

            &&

            pdf.size >
              MAX_PDF_SIZE
          ) {

            alert(
              'PDF too large',

              'Please select a PDF smaller than 20 MB.',

              undefined,

              { tone: 'warning' },
            );


            return;
          }


          setSelectedPdf(
            pdf,
          );


          setTitle(
            cleanFileTitle(
              pdf.fileName,
            ),
          );

        } catch (
          error
        ) {

          alert(
            'Unable to select PDF',

            error instanceof Error
              ? error.message
              : 'Unable to select PDF.',

            undefined,

            { tone: 'danger' },
          );

        } finally {

          setPickingPdf(
            false,
          );
        }

      },
      [
        alert,
        busy,
        selectedSource,
        resetMaterialData,
      ],
    );


  const removePdf =
    useCallback(
      () => {

        if (
          busy
        ) {

          return;
        }


        setSelectedPdf(
          null,
        );


        setTitle(
          '',
        );

      },
      [
        busy,
      ],
    );


  // =========================================================
  // IMAGE
  // =========================================================

  const selectImage =
    useCallback(
      async () => {

        if (
          busy
        ) {

          return;
        }


        if (
          selectedSource !==
          'image'
        ) {

          resetMaterialData();


          setSelectedSource(
            'image',
          );
        }


        try {

          setPickingImage(
            true,
          );


          const image =
            await imagePickerService
              .pickImage();


          if (
            !image
          ) {

            return;
          }


          if (
            image.size !==
              undefined

            &&

            image.size >
              MAX_IMAGE_SIZE
          ) {

            alert(
              'Image too large',

              'Please select an image smaller than 10 MB.',

              undefined,

              { tone: 'warning' },
            );


            return;
          }


          setSelectedImage(
            image,
          );


          setTitle(
            cleanFileTitle(
              image.fileName,
            ),
          );

        } catch (
          error
        ) {

          alert(
            'Unable to select image',

            error instanceof Error
              ? error.message
              : 'Unable to select image.',

            undefined,

            { tone: 'danger' },
          );

        } finally {

          setPickingImage(
            false,
          );
        }

      },
      [
        alert,
        busy,
        selectedSource,
        resetMaterialData,
      ],
    );


  const removeImage =
    useCallback(
      () => {

        if (
          busy
        ) {

          return;
        }


        setSelectedImage(
          null,
        );


        setTitle(
          '',
        );

      },
      [
        busy,
      ],
    );


  // =========================================================
  // CAMERA
  // =========================================================

  const capturePhoto =
    useCallback(
      async () => {

        if (
          busy
        ) {

          return;
        }


        if (
          selectedSource !==
          'camera'
        ) {

          resetMaterialData();


          setSelectedSource(
            'camera',
          );
        }


        try {

          setCapturing(
            true,
          );


          const image =
            await imagePickerService
              .captureImage();


          if (
            !image
          ) {

            return;
          }


          if (
            image.size !==
              undefined

            &&

            image.size >
              MAX_IMAGE_SIZE
          ) {

            alert(
              'Photo too large',

              'Please capture a photo smaller than 10 MB.',

              undefined,

              { tone: 'warning' },
            );


            return;
          }


          setCapturedImage(
            image,
          );


          setTitle(
            createCameraMaterialTitle(),
          );

        } catch (
          error
        ) {

          alert(
            'Unable to use camera',

            error instanceof Error
              ? error.message
              : 'Unable to capture a photo.',

            undefined,

            { tone: 'danger' },
          );

        } finally {

          setCapturing(
            false,
          );
        }

      },
      [
        alert,
        busy,
        selectedSource,
        resetMaterialData,
      ],
    );


  const retakePhoto =
    useCallback(
      async () => {

        if (
          busy
        ) {

          return;
        }


        setCapturedImage(
          null,
        );


        /*
         * Capture directly here rather than
         * calling capturePhoto() after state
         * changes. This avoids stale busy state.
         */

        try {

          setCapturing(
            true,
          );


          const image =
            await imagePickerService
              .captureImage();


          if (
            !image
          ) {

            return;
          }


          if (
            image.size !==
              undefined

            &&

            image.size >
              MAX_IMAGE_SIZE
          ) {

            alert(
              'Photo too large',

              'Please capture a photo smaller than 10 MB.',

              undefined,

              { tone: 'warning' },
            );


            return;
          }


          setCapturedImage(
            image,
          );


          setTitle(
            createCameraMaterialTitle(),
          );

        } catch (
          error
        ) {

          alert(
            'Unable to use camera',

            error instanceof Error
              ? error.message
              : 'Unable to capture a photo.',

            undefined,

            { tone: 'danger' },
          );

        } finally {

          setCapturing(
            false,
          );
        }

      },
      [
        alert,
        busy,
      ],
    );


  const removeCapturedImage =
    useCallback(
      () => {

        if (
          busy
        ) {

          return;
        }


        setCapturedImage(
          null,
        );


        setTitle(
          '',
        );

      },
      [
        busy,
      ],
    );


  // =========================================================
  // SAVE TEXT
  // =========================================================

  const saveText =
    useCallback(
      async () => {

        const cleanTitle =
          title.trim();


        const cleanContent =
          content.trim();


        if (
          !cleanTitle ||
          !cleanContent
        ) {

          return;
        }


        try {

          await createTextMaterial(
            cleanTitle,
            cleanContent,
          );


          onSaved();

        } catch (
          error
        ) {

          alert(
            'Unable to save material',

            error instanceof Error
              ? error.message
              : 'Unable to save material.',

            undefined,

            { tone: 'danger' },
          );
        }

      },
      [
        alert,
        title,
        content,
        createTextMaterial,
        onSaved,
      ],
    );


  // =========================================================
  // SAVE PDF
  // =========================================================

  const savePdf =
    useCallback(
      async () => {

        if (
          !selectedPdf ||
          !title.trim()
        ) {

          return;
        }


        try {

          setUploading(
            true,
          );


          await createPdfMaterial(
            title.trim(),

            selectedPdf.localUri,

            selectedPdf.fileName,

            'application/pdf',
          );


          onSaved();

        } catch (
          error
        ) {

          alert(
            'Unable to upload PDF',

            error instanceof Error
              ? error.message
              : 'Unable to upload PDF.',

            undefined,

            { tone: 'danger' },
          );

        } finally {

          setUploading(
            false,
          );
        }

      },
      [
        alert,
        title,
        selectedPdf,
        createPdfMaterial,
        onSaved,
      ],
    );


  // =========================================================
  // SAVE IMAGE
  // =========================================================

  const saveImage =
    useCallback(
      async () => {

        if (
          !selectedImage ||
          !title.trim()
        ) {

          return;
        }


        try {

          setUploading(
            true,
          );


          await createImageMaterial(
            title.trim(),

            selectedImage.localUri,

            selectedImage.fileName,

            selectedImage.mimeType,
          );


          onSaved();

        } catch (
          error
        ) {

          alert(
            'Unable to upload image',

            error instanceof Error
              ? error.message
              : 'Unable to upload image.',

            undefined,

            { tone: 'danger' },
          );

        } finally {

          setUploading(
            false,
          );
        }

      },
      [
        alert,
        title,
        selectedImage,
        createImageMaterial,
        onSaved,
      ],
    );


  // =========================================================
  // SAVE CAMERA
  // =========================================================

  const saveCameraPhoto =
    useCallback(
      async () => {

        if (
          !capturedImage ||
          !title.trim()
        ) {

          return;
        }


        try {

          setUploading(
            true,
          );


          await createImageMaterial(
            title.trim(),

            capturedImage.localUri,

            capturedImage.fileName,

            capturedImage.mimeType,
          );


          onSaved();

        } catch (
          error
        ) {

          alert(
            'Unable to upload photo',

            error instanceof Error
              ? error.message
              : 'Unable to upload the captured photo.',

            undefined,

            { tone: 'danger' },
          );

        } finally {

          setUploading(
            false,
          );
        }

      },
      [
        alert,
        title,
        capturedImage,
        createImageMaterial,
        onSaved,
      ],
    );


  // =========================================================
  // RETURN
  // =========================================================

  return {

    // Source
    selectedSource,

    selectText,
    selectPdf,
    selectImage,
    capturePhoto,

    // Form
    title,
    content,

    setTitle,
    setContent,

    // Files
    selectedPdf,
    selectedImage,
    capturedImage,

    removePdf,
    removeImage,
    removeCapturedImage,

    // Camera
    retakePhoto,

    // State
    busy,
    saving,
    creating,
    pickingPdf,
    pickingImage,
    capturing,

    // Save
    saveText,
    savePdf,
    saveImage,
    saveCameraPhoto,
  };
};