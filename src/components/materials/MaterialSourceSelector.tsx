import React from 'react';

import {
  SelectedMaterialSource,
} from '../../hooks/useAddMaterialScreen';

import MaterialSourceCard
  from './MaterialSourceCard';


interface MaterialSourceSelectorProps {

  selectedSource:
    SelectedMaterialSource;

  busy:
    boolean;

  pickingPdf:
    boolean;

  pickingImage:
    boolean;

  capturing:
    boolean;

  onSelectText:
    () => void;

  onSelectPdf:
    () => void;

  onSelectImage:
    () => void;

  onCapture:
    () => void;
}


const MaterialSourceSelector = ({
  selectedSource,

  busy,

  pickingPdf,

  pickingImage,

  capturing,

  onSelectText,

  onSelectPdf,

  onSelectImage,

  onCapture,
}: MaterialSourceSelectorProps) => {

  return (
    <>

      <MaterialSourceCard
        sourceType="text"

        description="Write or paste study notes."

        selected={
          selectedSource ===
          'text'
        }

        disabled={
          busy
        }

        onPress={
          onSelectText
        }
      />


      <MaterialSourceCard
        sourceType="pdf"

        description="Upload a PDF from your device."

        selected={
          selectedSource ===
          'pdf'
        }

        disabled={
          busy
        }

        loading={
          pickingPdf
        }

        onPress={
          onSelectPdf
        }
      />


      <MaterialSourceCard
        sourceType="image"

        description="Choose an image from your gallery."

        selected={
          selectedSource ===
          'image'
        }

        disabled={
          busy
        }

        loading={
          pickingImage
        }

        onPress={
          onSelectImage
        }
      />


      <MaterialSourceCard
        sourceType="camera"

        description="Capture study material using your camera."

        selected={
          selectedSource ===
          'camera'
        }

        disabled={
          busy
        }

        loading={
          capturing
        }

        onPress={
          onCapture
        }
      />

    </>
  );
};


export default MaterialSourceSelector;