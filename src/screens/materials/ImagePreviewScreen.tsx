import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  Text,
  View,
} from 'react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';

import {
  ImageDownloadService,
} from '../../services/storage/ImageDownloadService';


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
    subjectName,
  } = route.params;


  const downloadService =
    useMemo(
      () =>
        new ImageDownloadService(),
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


  useEffect(
    () => {

      let active =
        true;


      let cachedUri:
        string | null =
          null;


      const load =
        async () => {

          try {

            setLoading(
              true,
            );


            setError(
              null,
            );


            const uri =
              await downloadService
                .downloadImage(
                  materialId,
                );


            cachedUri =
              uri;


            if (active) {

              setImageUri(
                uri,
              );
            }

          } catch (
            loadError
          ) {

            if (active) {

              setError(
                loadError instanceof Error
                  ? loadError.message
                  : 'Unable to load image.',
              );
            }

          } finally {

            if (active) {

              setLoading(
                false,
              );
            }
          }
        };


      void load();


      return () => {

        active =
          false;


        if (cachedUri) {

          void downloadService
            .deleteCachedImage(
              cachedUri,
            );
        }
      };

    },
    [
      downloadService,
      materialId,
    ],
  );


  return (
    <SafeAreaView
      className="
        flex-1
        bg-slate-950
      ">

      <View
        className="
          border-b
          border-slate-800
          bg-slate-900
          px-5
          py-3
        ">

        <Text
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-wider
            text-sky-400
          ">

          Image preview

        </Text>


        <Text
          className="
            mt-1
            text-sm
            text-slate-300
          ">

          {subjectName}

        </Text>

      </View>


      {loading && (

        <View
          className="
            flex-1
            items-center
            justify-center
          ">

          <ActivityIndicator
            size="large"
            color="#38BDF8"
          />


          <Text
            className="
              mt-4
              text-sm
              text-slate-300
            ">

            Loading image...

          </Text>

        </View>

      )}


      {!loading &&
      !!error && (

        <View
          className="
            flex-1
            items-center
            justify-center
            px-8
          ">

          <Text
            className="
              text-center
              text-base
              font-bold
              text-white
            ">

            Unable to preview image

          </Text>


          <Text
            className="
              mt-3
              text-center
              text-sm
              leading-5
              text-slate-400
            ">

            {error}

          </Text>

        </View>

      )}


      {!loading &&
      !error &&
      imageUri && (

        <View
          className="
            flex-1
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

      )}

    </SafeAreaView>
  );
};


export default ImagePreviewScreen;