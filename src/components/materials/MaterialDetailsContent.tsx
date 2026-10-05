import React from 'react';

import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

import {
  FileImage,
  FileText,
  Trash2,
} from 'lucide-react-native';

import {
  Material,
} from '../../domain/models/Material';

import AiSummaryActionCard
  from '../ai/AiSummaryActionCard';

import AppButton
  from '../common/AppButton';

import SectionCard
  from '../common/SectionCard';

import MaterialEditForm
  from './MaterialEditForm';

import MaterialFileActionCard
  from './MaterialFileActionCard';

import MaterialTypeBanner
  from './MaterialTypeBanner';


interface MaterialDetailsContentProps {

  material:
    Material;

  editing:
    boolean;

  title:
    string;

  content:
    string;

  busy:
    boolean;

  isUpdating:
    boolean;

  isDeleting:
    boolean;

  onTitleChange:
    (
      value:
        string,
    ) => void;

  onContentChange:
    (
      value:
        string,
    ) => void;

  onCancelEdit:
    () => void;

  onSave:
    () => void;

  onPreviewPdf:
    () => void;

  onPreviewImage:
    () => void;

  onGenerateSummary:
    () => void;

  aiSummaryDisabled?:
    boolean;

  onDelete:
    () => void;
}


const MaterialDetailsContent = ({
  material,

  editing,

  title,

  content,

  busy,

  isUpdating,

  isDeleting,

  onTitleChange,

  onContentChange,

  onCancelEdit,

  onSave,

  onPreviewPdf,

  onPreviewImage,

  onGenerateSummary,

  aiSummaryDisabled =
    false,

  onDelete,
}: MaterialDetailsContentProps) => {

  const isPdf =
    material.sourceType ===
    'pdf';


  const isImage =
    material.sourceType ===
      'image'

    ||

    material.sourceType ===
      'camera';


  return (

    <>

      {/* =====================================================
          TYPE
      ====================================================== */}

      <MaterialTypeBanner
        material={
          material
        }
      />


      {/* =====================================================
          EDIT MODE
      ====================================================== */}

      {editing ? (

        <MaterialEditForm
          material={
            material
          }

          title={
            title
          }

          content={
            content
          }

          busy={
            busy
          }

          isUpdating={
            isUpdating
          }

          onTitleChange={
            onTitleChange
          }

          onContentChange={
            onContentChange
          }

          onCancel={
            onCancelEdit
          }

          onSave={
            onSave
          }
        />

      ) : (

        <>

          {/* =================================================
              TITLE
          ================================================== */}

          <SectionCard
            label="Title"

            className="
              mb-4
            ">

            <Text
              className="
                text-base
                font-bold
                text-slate-900
              ">

              {
                material.title
              }

            </Text>

          </SectionCard>


          {/* =================================================
              TEXT CONTENT
          ================================================== */}

          {material.sourceType ===
            'text' && (

            <SectionCard
              label="Study content"

              className="
                mb-4
              ">

              <Text
                className="
                  leading-6
                  text-slate-700
                ">

                {
                  material.content
                }

              </Text>

            </SectionCard>

          )}


          {/* =================================================
              PDF
          ================================================== */}

          {isPdf && (

            <MaterialFileActionCard
              label="PDF document"

              fileName={
                material.fileName ??
                'PDF document'
              }

              icon={
                FileText
              }

              color="#E11D48"

              background="#FFF1F2"

              actionTitle="Preview PDF"

              tone="danger"

              onPreview={
                onPreviewPdf
              }
            />

          )}


          {/* =================================================
              IMAGE / CAMERA
          ================================================== */}

          {isImage && (

            <MaterialFileActionCard
              label={
                material.sourceType ===
                  'camera'
                  ? 'Camera image'
                  : 'Image file'
              }

              fileName={
                material.fileName ??
                (
                  material.sourceType ===
                    'camera'
                    ? 'Camera material'
                    : 'Image material'
                )
              }

              icon={
                FileImage
              }

              color="#0284C7"

              background="#E0F2FE"

              actionTitle="Preview image"

              tone="info"

              onPreview={
                onPreviewImage
              }
            />

          )}


          {/* =================================================
              AI SUMMARY
          ================================================== */}

          <View
            className="
              mb-4
            ">

            <AiSummaryActionCard
              onPress={
                onGenerateSummary
              }

              disabled={
                aiSummaryDisabled
              }
            />

          </View>


          {/* =================================================
              DELETE
          ================================================== */}

          <AppButton
            title="Delete material"

            icon={
              isDeleting
                ? (
                    <ActivityIndicator
                      color="#DC2626"
                    />
                  )

                : (
                    <Trash2
                      size={18}
                      color="#DC2626"
                    />
                  )
            }

            tone="danger"

            variant="soft"

            disabled={
              busy
            }

            onPress={
              onDelete
            }
          />

        </>

      )}

    </>
  );
};


export default MaterialDetailsContent;