import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';

import {
  FileText,
  RefreshCw,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  useFocusEffect,
} from '@react-navigation/native';

import Pdf from 'react-native-pdf';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';

import {
  PdfDownloadService,
} from '../../services/storage/PdfDownloadService';


type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'PdfPreview'
  >;


const PdfPreviewScreen = ({
  navigation,
  route,
}: Props) => {

  const {
    materialId,
    subjectId,
    subjectName,
  } = route.params;


  // =========================================================
  // Service
  // =========================================================

  const downloadService =
    useMemo(
      () =>
        new PdfDownloadService(),
      [],
    );


  // =========================================================
  // State
  // =========================================================

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
  // Back Navigation
  // =========================================================

  const handleBack =
    useCallback(
      () => {

        if (
          navigation.canGoBack()
        ) {

          navigation.goBack();

          return;
        }


        navigation.replace(
          'MaterialDetails',
          {
            materialId,

            subjectId,

            subjectName,
          },
        );

      },
      [
        navigation,
        materialId,
        subjectId,
        subjectName,
      ],
    );


  // =========================================================
  // Android Hardware Back
  // =========================================================

  useFocusEffect(
    useCallback(
      () => {

        const subscription =
          BackHandler.addEventListener(
            'hardwareBackPress',
            () => {

              handleBack();

              return true;
            },
          );


        return () => {

          subscription.remove();
        };

      },
      [
        handleBack,
      ],
    ),
  );


  // =========================================================
  // Download PDF
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


          // ===============================================
          // Remove previous cached file
          // ===============================================

          if (
            currentPdfUri.current
          ) {

            await downloadService
              .deleteCachedPdf(
                currentPdfUri.current,
              );


            currentPdfUri.current =
              null;


            setPdfUri(
              null,
            );
          }


          // ===============================================
          // Secure download
          // ===============================================

          const localUri =
            await downloadService
              .downloadPdf(
                materialId,
              );


          currentPdfUri.current =
            localUri;


          setPdfUri(
            localUri,
          );


        } catch (
          loadError
        ) {

          console.error(
            'PDF preview download error:',
            loadError,
          );


          const message =
            loadError instanceof Error
              ? loadError.message
              : (
                  'Unable to load '
                  + 'this PDF.'
                );


          setError(
            message,
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


  // =========================================================
  // Initial Load
  // =========================================================

  useEffect(
    () => {

      void loadPdf();

    },
    [
      loadPdf,
    ],
  );


  // =========================================================
  // Cleanup Cached PDF
  // =========================================================

  useEffect(
    () => {

      return () => {

        const uri =
          currentPdfUri.current;


        if (uri) {

          void downloadService
            .deleteCachedPdf(
              uri,
            );
        }
      };

    },
    [
      downloadService,
    ],
  );


  // =========================================================
  // PDF Source
  // =========================================================

  const pdfSource =
    useMemo(
      () => {

        if (!pdfUri) {

          return null;
        }


        return {
          uri:
            pdfUri,

          cache:
            false,
        };

      },
      [
        pdfUri,
      ],
    );


  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

      {/* =====================================================
          SUBJECT INFO
      ====================================================== */}

      <View
        className="
          border-b
          border-slate-200
          bg-white
          px-5
          py-3
        ">

        <Text
          className="
            text-xs
            font-semibold
            text-indigo-600
          ">

          PDF PREVIEW

        </Text>


        <Text
          className="
            mt-1
            text-sm
            text-slate-500
          "
          numberOfLines={
            1
          }>

          {subjectName}

        </Text>

      </View>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <View
        className="
          flex-1
          bg-slate-100
        ">

        {loading ? (

          // =================================================
          // Loading
          // =================================================

          <View
            className="
              flex-1
              items-center
              justify-center
              px-8
            ">

            <View
              className="
                mb-5
                h-16
                w-16
                items-center
                justify-center
                rounded-[20px]
                bg-indigo-50
              ">

              <ActivityIndicator
                size="small"
                color="#4F46E5"
              />

            </View>


            <Text
              className="
                text-lg
                font-bold
                text-slate-900
              ">

              Loading PDF

            </Text>


            <Text
              className="
                mt-2
                max-w-[280px]
                text-center
                text-sm
                leading-5
                text-slate-500
              ">

              Securely loading your
              study material...

            </Text>

          </View>

        ) : error ? (

          // =================================================
          // Error
          // =================================================

          <View
            className="
              flex-1
              items-center
              justify-center
              px-8
            ">

            <View
              className="
                mb-5
                h-16
                w-16
                items-center
                justify-center
                rounded-[20px]
                bg-red-50
              ">

              <FileText
                size={29}
                color="#DC2626"
              />

            </View>


            <Text
              className="
                text-xl
                font-bold
                text-slate-900
              ">

              Couldn't open PDF

            </Text>


            <Text
              className="
                mt-2
                max-w-[300px]
                text-center
                text-sm
                leading-5
                text-slate-500
              ">

              {error}

            </Text>


            <Pressable
              accessibilityRole="button"
              onPress={() => {

                void loadPdf();

              }}
              className="
                mt-6
                flex-row
                items-center
                rounded-xl
                bg-indigo-600
                px-6
                py-3
              "
              style={({
                pressed,
              }) => ({

                opacity:
                  pressed
                    ? 0.8
                    : 1,

              })}>

              <RefreshCw
                size={17}
                color="#FFFFFF"
              />


              <Text
                className="
                  ml-2
                  text-sm
                  font-bold
                  text-white
                ">

                Try again

              </Text>

            </Pressable>

          </View>

        ) : pdfSource ? (

          // =================================================
          // PDF
          // =================================================

          <View
            className="
              flex-1
              bg-slate-100
            ">

            <Pdf
              source={
                pdfSource
              }

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

              spacing={
                10
              }

              minScale={
                1
              }

              maxScale={
                4
              }

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


            {/* =============================================
                PAGE NUMBER
            ============================================== */}

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
                  shadow-sm
                ">

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

          // =================================================
          // Empty
          // =================================================

          <View
            className="
              flex-1
              items-center
              justify-center
            ">

            <Text
              className="
                text-sm
                text-slate-500
              ">

              PDF unavailable.

            </Text>

          </View>

        )}

      </View>

    </SafeAreaView>
  );
};


export default PdfPreviewScreen;