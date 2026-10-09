import React, {
  useCallback,
  useEffect,
  useMemo,
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

import Pdf
  from 'react-native-pdf';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  useNetwork,
} from '../../hooks/useNetwork';

import {
  PdfDownloadService,
} from '../../services/storage/PdfDownloadService';

import {
  offlineFileStorageService,
} from '../../services/offline/OfflineFileStorageService';


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
  // AUTH
  // =========================================================

  const {
    user,
  } = useAuth();


  const userId =
    user
      ? String(
          user.id,
        )
      : null;


  // =========================================================
  // NETWORK
  // =========================================================

  const {
    isOnline,
    initialized:
      networkInitialized,
  } = useNetwork();


  // =========================================================
  // DOWNLOAD SERVICE
  // =========================================================

  const downloadService =
    useMemo(
      () =>
        new PdfDownloadService(),
      [],
    );


  // =========================================================
  // STATE
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


  const [
    loadedFromOfflineStorage,
    setLoadedFromOfflineStorage,
  ] = useState(
    false,
  );


  // =========================================================
  // FILE NAME
  // =========================================================
  //
  // OfflineFileStorageService only needs the extension
  // when constructing the final persistent path.
  //
  // Therefore this deterministic name is enough.
  //
  // Example:
  //
  // materialId = 55
  //
  // destination:
  // .../pdf/55.pdf
  //
  // =========================================================

  const offlineFileName =
    `${materialId}.pdf`;


  // =========================================================
  // BACK NAVIGATION
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
  // ANDROID HARDWARE BACK
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
  // LOAD PDF
  // =========================================================

  const loadPdf =
    useCallback(
      async () => {

        // -----------------------------------------------------
        // Wait until network state is initialized.
        //
        // We still check local storage first below, but this
        // avoids showing an offline error before NetInfo knows
        // the actual state.
        // -----------------------------------------------------

        if (
          !networkInitialized
        ) {

          setLoading(
            true,
          );


          return;
        }


        let temporaryDownloadedUri:
          string | null =
          null;


        try {

          setLoading(
            true,
          );


          setError(
            null,
          );


          setPdfUri(
            null,
          );


          setCurrentPage(
            1,
          );


          setTotalPages(
            0,
          );


          setLoadedFromOfflineStorage(
            false,
          );


          // ===================================================
          // AUTH CHECK
          // ===================================================

          if (
            !userId
          ) {

            setError(
              'Your session is unavailable. Please sign in again.',
            );


            return;
          }


          // ===================================================
          // STEP 1:
          // CHECK PERMANENT OFFLINE COPY FIRST
          // ===================================================

          const persistedFile =
            await offlineFileStorageService
              .getPersistedFile({
                userId,

                subjectId,

                materialId,

                fileName:
                  offlineFileName,

                sourceType:
                  'pdf',
              });


          if (
            persistedFile
          ) {

            console.log(
              '[PDF PREVIEW] Using persisted offline PDF',
              {
                materialId,

                path:
                  persistedFile.localPath,
              },
            );


            setLoadedFromOfflineStorage(
              true,
            );


            setPdfUri(
              persistedFile.localUri,
            );


            return;
          }


          // ===================================================
          // STEP 2:
          // NO LOCAL COPY + OFFLINE
          // ===================================================

          if (
            !isOnline
          ) {

            setError(
              'This PDF is not available offline yet. Connect to the internet and open it once to save an offline copy.',
            );


            return;
          }


          // ===================================================
          // STEP 3:
          // DOWNLOAD SECURELY FROM FASTAPI
          // ===================================================

          console.log(
            '[PDF PREVIEW] No offline copy. Downloading PDF.',
            {
              materialId,
            },
          );


          temporaryDownloadedUri =
            await downloadService
              .downloadPdf(
                materialId,
              );


          // ===================================================
          // STEP 4:
          // COPY DOWNLOAD INTO PERMANENT APP STORAGE
          // ===================================================

          const persisted =
            await offlineFileStorageService
              .persistFile({
                userId,

                subjectId,

                materialId,

                sourceUri:
                  temporaryDownloadedUri,

                fileName:
                  offlineFileName,

                sourceType:
                  'pdf',
              });


          console.log(
            '[PDF PREVIEW] PDF saved for offline use',
            {
              materialId,

              path:
                persisted.localPath,
            },
          );


          setLoadedFromOfflineStorage(
            false,
          );


          // ===================================================
          // STEP 5:
          // RENDER PERMANENT COPY
          // ===================================================

          setPdfUri(
            persisted.localUri,
          );


        } catch (
          loadError
        ) {

          console.warn(
            'PDF preview load error:',
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

          // ===================================================
          // DELETE ONLY TEMPORARY DOWNLOAD
          // ===================================================
          //
          // IMPORTANT:
          //
          // We do NOT delete the permanent file stored by
          // OfflineFileStorageService.
          //
          // ===================================================

          if (
            temporaryDownloadedUri
          ) {

            try {

              await downloadService
                .deleteCachedPdf(
                  temporaryDownloadedUri,
                );

            } catch (
              cleanupError
            ) {

              console.warn(
                'Temporary PDF cleanup failed:',
                cleanupError,
              );
            }
          }


          setLoading(
            false,
          );
        }
      },
      [
        downloadService,

        materialId,
        subjectId,

        userId,

        isOnline,
        networkInitialized,

        offlineFileName,
      ],
    );


  // =========================================================
  // INITIAL LOAD
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
  // PDF SOURCE
  // =========================================================

  const pdfSource =
    useMemo(
      () => {

        if (
          !pdfUri
        ) {

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

          {
            subjectName
          }

        </Text>


        {
          loadedFromOfflineStorage
          &&
          !isOnline
          &&
          (

            <View
              className="
                mt-2
                self-start
                rounded-full
                bg-amber-50
                px-3
                py-1
              ">

              <Text
                className="
                  text-xs
                  font-semibold
                  text-amber-700
                ">

                Offline copy

              </Text>

            </View>

          )
        }

      </View>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <View
        className="
          flex-1
          bg-slate-100
        ">

        {
          loading
            ? (

              // ===============================================
              // LOADING
              // ===============================================

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

                  Preparing your
                  study material...

                </Text>

              </View>

            )
            : error
              ? (

                // =============================================
                // ERROR
                // =============================================

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
                      max-w-[310px]
                      text-center
                      text-sm
                      leading-5
                      text-slate-500
                    ">

                    {
                      error
                    }

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

              )
              : pdfSource
                ? (

                  // ===========================================
                  // PDF
                  // ===========================================

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

                        console.warn(
                          'PDF renderer error:',
                          pdfError,
                        );


                        setError(
                          'The PDF is available on this device, but it could not be displayed.',
                        );
                      }}
                    />


                    {/* =========================================
                        PAGE NUMBER
                    ========================================== */}

                    {
                      totalPages > 0
                      &&
                      (

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

                            Page {
                              currentPage
                            }
                            {' '}of{' '}
                            {
                              totalPages
                            }

                          </Text>

                        </View>

                      )
                    }

                  </View>

                )
                : (

                  // ===========================================
                  // EMPTY
                  // ===========================================

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

                )
        }

      </View>

    </SafeAreaView>
  );
};


export default PdfPreviewScreen;
