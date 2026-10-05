import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Image,
  SafeAreaView,
  View,
} from 'react-native';

import {
  FileImage,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import ScreenState
  from '../../components/common/ScreenState';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';

import {
  MaterialFileDownloadService,
} from '../../services/storage/MaterialFileDownloadService';


type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'ImagePreview'
  >;


const ImagePreviewScreen = ({
  route,
}: Props) => {

  const {
    materialId,
  } = route.params;


  const downloadService =
    useMemo(
      () =>
        new MaterialFileDownloadService(),
      [],
    );


  const [
    imageUri,
    setImageUri,
  ] = useState<
    string | null
  >(null);


  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );


  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);


  const currentImageUri =
    useRef<
      string | null
    >(null);


  // =========================================================
  // LOAD IMAGE
  // =========================================================

  const loadImage =
    useCallback(
      async () => {

        try {

          setLoading(
            true,
          );


          setError(
            null,
          );


          if (
            currentImageUri.current
          ) {

            await downloadService
              .deleteCachedFile(
                currentImageUri.current,
              );


            currentImageUri.current =
              null;


            setImageUri(
              null,
            );
          }


          const uri =
            await downloadService
              .download(
                materialId,
              );


          currentImageUri.current =
            uri;


          setImageUri(
            uri,
          );

        } catch (
          loadError
        ) {

          console.error(
            'Image preview error:',
            loadError,
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load image.',
          );

        } finally {

          setLoading(
            false,
          );
        }
      },
      [
        downloadService,
        materialId,
      ],
    );


  useEffect(
    () => {

      void loadImage();

    },
    [
      loadImage,
    ],
  );


  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(
    () => {

      return () => {

        void downloadService
          .deleteCachedFile(
            currentImageUri.current,
          );
      };

    },
    [
      downloadService,
    ],
  );


  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView
      className="
        flex-1
        bg-black
      ">

      {loading ? (

        <View
          className="
            flex-1
            bg-slate-950
          ">

          <ScreenState
            loading
            title="Loading image"
            description="Securely loading your study material..."
            dark
          />

        </View>

      ) : error ? (

        <View
          className="
            flex-1
            bg-slate-950
          ">

          <ScreenState
            title="Couldn't open image"
            description={error}
            icon={
              FileImage
            }
            iconColor="#38BDF8"
            actionTitle="Try again"
            onAction={
              loadImage
            }
            dark
          />

        </View>

      ) : imageUri ? (

        <View
          className="
            flex-1
            items-center
            justify-center
            bg-black
          ">

          <Image
            source={{
              uri:
                imageUri,
            }}
            resizeMode="contain"
            className="
              h-full
              w-full
            "
          />

        </View>

      ) : (

        <View
          className="
            flex-1
            bg-slate-950
          ">

          <ScreenState
            title="Image unavailable"
            dark
          />

        </View>

      )}

    </SafeAreaView>
  );
};


export default ImagePreviewScreen;