import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';

export interface PickedPdf {
  fileName: string;

  localUri: string;

  size?: number;
}

export class PdfPickerService {
  async pickPdf(): Promise<
    PickedPdf | null
  > {
    try {
      const [
        selectedFile,
      ] = await pick({
        type: [
          types.pdf,
        ],

        allowMultiSelection:
          false,
      });

      /*
       * Some Android document
       * providers ignore MIME filters.
       */
      if (
        !selectedFile
          .hasRequestedType
      ) {
        throw new Error(
          'Please select a PDF file.',
        );
      }

      const fileName =
        selectedFile.name ??
        `material_${Date.now()}.pdf`;

      /*
       * Convert Android content:// URI
       * into an app-local file.
       *
       * This also gives us a stable
       * local file path for Firebase
       * Storage putFile().
       */
      const [
        copyResult,
      ] =
        await keepLocalCopy({
          files: [
            {
              uri:
                selectedFile.uri,

              fileName,
            },
          ],

          destination:
            'cachesDirectory',
        });

      if (
        copyResult.status !==
        'success'
      ) {
        throw new Error(
          `Unable to prepare PDF: ${copyResult.copyError}`,
        );
      }

      return {
        fileName,

        localUri:
          copyResult.localUri,

        size:
          selectedFile.size ??
          undefined,
      };
    } catch (error) {
      if (
        isErrorWithCode(
          error,
        ) &&
        error.code ===
          errorCodes
            .OPERATION_CANCELED
      ) {
        return null;
      }

      throw error;
    }
  }
}