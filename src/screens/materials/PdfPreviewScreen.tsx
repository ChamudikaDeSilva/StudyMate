import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BackHandler, StyleSheet, Text, View } from 'react-native';

import { FileText } from 'lucide-react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenState from '../../components/common/ScreenState';
import { colors } from '../../constants/colors';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useFocusEffect } from '@react-navigation/native';

import Pdf from 'react-native-pdf';

import { SubjectsStackParamList } from '../../navigation/navigationTypes';

import { useAuth } from '../../hooks/useAuth';

import { useNetwork } from '../../hooks/useNetwork';

import { PdfDownloadService } from '../../services/storage/PdfDownloadService';

import { offlineFileStorageService } from '../../services/offline/OfflineFileStorageService';

type Props = NativeStackScreenProps<SubjectsStackParamList, 'PdfPreview'>;

const PdfPreviewScreen = ({ navigation, route }: Props) => {
  const { materialId, subjectId, subjectName } = route.params;

  const { user } = useAuth();

  const userId = user ? String(user.id) : null;

  const { isOnline, initialized: networkInitialized } = useNetwork();

  const downloadService = useMemo(() => new PdfDownloadService(), []);

  const [pdfUri, setPdfUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(0);

  const [loadedFromOfflineStorage, setLoadedFromOfflineStorage] =
    useState(false);

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

  const offlineFileName = `${materialId}.pdf`;

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();

      return;
    }

    navigation.replace('MaterialDetails', {
      materialId,

      subjectId,

      subjectName,
    });
  }, [navigation, materialId, subjectId, subjectName]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleBack();

          return true;
        },
      );

      return () => {
        subscription.remove();
      };
    }, [handleBack]),
  );

  const loadPdf = useCallback(async () => {
    // -----------------------------------------------------
    // Wait until network state is initialized.
    //
    // We still check local storage first below, but this
    // avoids showing an offline error before NetInfo knows
    // the actual state.
    // -----------------------------------------------------

    if (!networkInitialized) {
      setLoading(true);

      return;
    }

    let temporaryDownloadedUri: string | null = null;

    try {
      setLoading(true);

      setError(null);

      setPdfUri(null);

      setCurrentPage(1);

      setTotalPages(0);

      setLoadedFromOfflineStorage(false);

      if (!userId) {
        setError('Your session is unavailable. Please sign in again.');

        return;
      }

      // ===================================================
      // STEP 1:
      // CHECK PERMANENT OFFLINE COPY FIRST
      // ===================================================

      const persistedFile = await offlineFileStorageService.getPersistedFile({
        userId,

        subjectId,

        materialId,

        fileName: offlineFileName,

        sourceType: 'pdf',
      });

      if (persistedFile) {
        console.log('[PDF PREVIEW] Using persisted offline PDF', {
          materialId,

          path: persistedFile.localPath,
        });

        setLoadedFromOfflineStorage(true);

        setPdfUri(persistedFile.localUri);

        return;
      }

      // ===================================================
      // STEP 2:
      // NO LOCAL COPY + OFFLINE
      // ===================================================

      if (!isOnline) {
        setError(
          'This PDF is not available offline yet. Connect to the internet and open it once to save an offline copy.',
        );

        return;
      }

      // ===================================================
      // STEP 3:
      // DOWNLOAD SECURELY FROM FASTAPI
      // ===================================================

      console.log('[PDF PREVIEW] No offline copy. Downloading PDF.', {
        materialId,
      });

      temporaryDownloadedUri = await downloadService.downloadPdf(materialId);

      // ===================================================
      // STEP 4:
      // COPY DOWNLOAD INTO PERMANENT APP STORAGE
      // ===================================================

      const persisted = await offlineFileStorageService.persistFile({
        userId,

        subjectId,

        materialId,

        sourceUri: temporaryDownloadedUri,

        fileName: offlineFileName,

        sourceType: 'pdf',
      });

      console.log('[PDF PREVIEW] PDF saved for offline use', {
        materialId,

        path: persisted.localPath,
      });

      setLoadedFromOfflineStorage(false);

      // ===================================================
      // STEP 5:
      // RENDER PERMANENT COPY
      // ===================================================

      setPdfUri(persisted.localUri);
    } catch (loadError) {
      console.warn('PDF preview load error:', loadError);

      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load ' + 'this PDF.';

      setError(message);
    } finally {
      //
      // IMPORTANT:
      //
      // We do NOT delete the permanent file stored by
      // OfflineFileStorageService.
      //
      // ===================================================

      if (temporaryDownloadedUri) {
        try {
          await downloadService.deleteCachedPdf(temporaryDownloadedUri);
        } catch (cleanupError) {
          console.warn('Temporary PDF cleanup failed:', cleanupError);
        }
      }

      setLoading(false);
    }
  }, [
    downloadService,

    materialId,
    subjectId,

    userId,

    isOnline,
    networkInitialized,

    offlineFileName,
  ]);

  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  const pdfSource = useMemo(() => {
    if (!pdfUri) {
      return null;
    }

    return {
      uri: pdfUri,

      cache: false,
    };
  }, [pdfUri]);

  return (
    <ScreenContainer edges={['left', 'right', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-line bg-white px-5 py-3">
        <View className="flex-row items-center">
          <FileText size={16} color={colors.primary} />
          <Text className="ml-2 text-xs font-semibold text-brand-600">
            Document preview
          </Text>
        </View>
        {loadedFromOfflineStorage && !isOnline && (
          <View className="rounded-full bg-brand-50 px-3 py-1.5">
            <Text className="text-[10px] font-semibold text-brand-600">
              Offline copy
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1 bg-canvas">
        {loading ? (
          <ScreenState
            loading
            title="Loading PDF"
            description={
              isOnline
                ? 'Preparing your study material...'
                : 'Looking for an offline copy...'
            }
          />
        ) : error ? (
          <ScreenState
            title="Couldn't open PDF"
            description={error}
            icon={FileText}
            iconColor={colors.primary}
            actionTitle="Try again"
            onAction={loadPdf}
          />
        ) : pdfSource ? (
          <View className="flex-1">
            <Pdf
              source={pdfSource}
              style={styles.document}
              trustAllCerts={false}
              enablePaging={false}
              horizontal={false}
              spacing={14}
              minScale={1}
              maxScale={4}
              onLoadComplete={numberOfPages => {
                setTotalPages(numberOfPages);
                setCurrentPage(1);
              }}
              onPageChanged={(page, numberOfPages) => {
                setCurrentPage(page);
                setTotalPages(numberOfPages);
              }}
              onError={pdfError => {
                console.warn('PDF renderer error:', pdfError);
                setError(
                  'The PDF is available on this device, but it could not be displayed.',
                );
              }}
            />

            {totalPages > 0 && (
              <View
                pointerEvents="none"
                className="absolute bottom-5 self-center rounded-full border border-brand-100 bg-white px-4 py-2.5 shadow-sm"
              >
                <Text className="text-xs font-bold text-brand-600">
                  Page {currentPage} of {totalPages}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <ScreenState
            title="PDF unavailable"
            description="No document is available for this material."
            icon={FileText}
          />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  document: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
});

export default PdfPreviewScreen;
