import React from 'react';

import {
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Save,
  X,
} from 'lucide-react-native';

import {
  Material,
} from '../../domain/models/Material';

import AppButton
  from '../common/AppButton';

import AppInput
  from '../common/AppInput';

import SectionCard
  from '../common/SectionCard';


interface MaterialEditFormProps {

  material:
    Material;

  title:
    string;

  content:
    string;

  busy:
    boolean;

  isUpdating:
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

  onCancel:
    () => void;

  onSave:
    () => void;
}


const MaterialEditForm = ({
  material,

  title,

  content,

  busy,

  isUpdating,

  onTitleChange,

  onContentChange,

  onCancel,

  onSave,
}: MaterialEditFormProps) => {

  const saveDisabled =

    busy

    ||

    !title.trim()

    ||

    (
      material.sourceType ===
        'text'

      &&

      !content.trim()
    );


  return (

    <SectionCard>

      {/* ===================================================
          TITLE
      ==================================================== */}

      <AppInput
        label="Title"

        value={
          title
        }

        onChangeText={
          onTitleChange
        }

        editable={
          !busy
        }

        placeholder="Material title"
      />


      {/* ===================================================
          TEXT CONTENT
      ==================================================== */}

      {material.sourceType ===
        'text' && (

        <View
          className="
            mb-5
          ">

          <Text
            className="
              mb-2
              text-sm
              font-semibold
              text-slate-800
            ">

            Content

          </Text>


          <TextInput
            value={
              content
            }

            onChangeText={
              onContentChange
            }

            editable={
              !busy
            }

            multiline

            textAlignVertical="top"

            placeholder="Study content"

            placeholderTextColor="#94A3B8"

            className="
              min-h-[220px]
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-4
              text-slate-900
            "
          />

        </View>

      )}


      {/* ===================================================
          ACTIONS
      ==================================================== */}

      <View
        className="
          flex-row
        ">

        <AppButton
          title="Cancel"

          icon={
            <X
              size={18}
              color="#475569"
            />
          }

          variant="outline"

          tone="neutral"

          disabled={
            busy
          }

          onPress={
            onCancel
          }

          className="
            mr-3
            flex-1
          "
        />


        <AppButton
          title="Save"

          icon={
            <Save
              size={18}
              color="#FFFFFF"
            />
          }

          loading={
            isUpdating
          }

          disabled={
            saveDisabled
          }

          onPress={
            onSave
          }

          className="
            flex-1
          "
        />

      </View>

    </SectionCard>
  );
};


export default MaterialEditForm;