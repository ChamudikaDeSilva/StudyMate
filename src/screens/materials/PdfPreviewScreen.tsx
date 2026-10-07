import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  SafeAreaView,
  Text,
  View,
} from 'react-native';

import {
  FileText,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import Pdf
  from 'react-native-pdf';

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
    'PdfPreview'
  >;


const PdfPreviewScreen = ({
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
    pdfUri,
    setPdfUri,
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


  const [
    currentPage,
    setCurrentPage,
  ] = useState(
    1,
  );


  const [
    totalPages,
    setTotalPages,
  ] = useState(
    0,
  );


  const currentPdfUri =
    useRef<
      string | null
    >(null);


  // =========================================================
  // LOAD PDF
  // =========================================================

  const loadPdf =
    useCallback(
      async () => {

        try {

          setLoading(
            true,
          );


          setError(
            null,
          );


          setCurrentPage(
            1,
          );


          setTotalPages(
            0,
          );


          if (
            currentPdfUri.current
          ) {

            await downloadService
              .deleteCachedFile(
                currentPdfUri.current,
              );


            currentPdfUri.current =
              null;


            setPdfUri(
              null,
            );
          }


          const uri =
            await downloadService
              .download(
                materialId,
                'pdf',
              );


          currentPdfUri.current =
            uri;


          setPdfUri(
            uri,
          );

        } catch (
          loadError
        ) {

          console.error(
            'PDF preview error:',
            loadError,
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load this PDF.',
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

      void loadPdf();

    },
    [
      loadPdf,
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
            currentPdfUri.current,
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
        bg-slate-100
      ">

      {loading ? (

        <ScreenState
          loading
          title="Loading PDF"
          description="Securely loading your study material..."
        />

      ) : error ? (

        <ScreenState
          title="Couldn't open PDF"
          description={error}
          icon={
            FileText
          }
          iconColor="#DC2626"
          actionTitle="Try again"
          onAction={
            loadPdf
          }
        />

      ) : pdfUri ? (

        <View
          className="
            flex-1
            bg-slate-100
          ">

          <Pdf
            source={{
              uri:
                pdfUri,

              cache:
                false,
            }}
            style={{
              flex:
                1,

              width:
                '100%',

              backgroundColor:
                '#F1F5F9',
            }}
            trustAllCerts={
              false
            }
            enablePaging={
              false
            }
            horizontal={
              false
            }
            spacing={10}
            minScale={1}
            maxScale={4}
            onLoadComplete={(
              numberOfPages,
            ) => {

              setTotalPages(
                numberOfPages,
              );


              setCurrentPage(
                1,
              );
            }}
            onPageChanged={(
              page,
              numberOfPages,
            ) => {

              setCurrentPage(
                page,
              );


              setTotalPages(
                numberOfPages,
              );
            }}
            onError={(
              pdfError,
            ) => {

              console.error(
                'PDF renderer error:',
                pdfError,
              );


              setError(
                'The PDF was downloaded, '
                + 'but it could not be displayed.',
              );
            }}
          />


          {totalPages > 0 && (

            <View
              pointerEvents="none"
              className="
                absolute
                bottom-5
                self-center
                rounded-full
                border
                border-indigo-100
                bg-white
                px-4
                py-2
              "
              style={{
                elevation:
                  8,

                zIndex:
                  30,
              }}>

              <Text
                className="
                  text-xs
                  font-bold
                  text-indigo-600
                ">

                Page {currentPage}
                {' '}of{' '}
                {totalPages}

              </Text>

            </View>

          )}

        </View>

      ) : (

        <ScreenState
          title="PDF unavailable"
        />

      )}

    </SafeAreaView>
  );
};


export default PdfPreviewScreen;