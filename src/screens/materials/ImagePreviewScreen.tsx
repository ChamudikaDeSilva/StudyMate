import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Image, Text, View } from 'react-native';

import { FileImage } from 'lucide-react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import ScreenState from '../../components/common/ScreenState';
import ScreenContainer from '../../components/common/ScreenContainer';

import { SubjectsStackParamList } from '../../navigation/navigationTypes';

import { MaterialFileDownloadService } from '../../services/storage/MaterialFileDownloadService';

import { offlineFileStorageService } from '../../services/offline/OfflineFileStorageService';

import { getMaterialsCache } from '../../data/local/storage/offlineCache';

import { useAuth } from '../../hooks/useAuth';

import { useNetwork } from '../../hooks/useNetwork';

type Props = NativeStackScreenProps<SubjectsStackParamList, 'ImagePreview'>;

const ImagePreviewScreen = ({ route }: Props) => {
  const { materialId, subjectId } = route.params;

  const { user } = useAuth();

  const userId = user ? String(user.id) : null;

  const { isOnline, initialized: networkInitialized } = useNetwork();

  const downloadService = useMemo(() => new MaterialFileDownloadService(), []);

  const [imageUri, setImageUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [loadedFromOfflineStorage, setLoadedFromOfflineStorage] =
    useState(false);

  /*
   * Only temporary downloaded files are kept here.
   *
   * Permanent files from OfflineFileStorageService
   * must NOT be deleted when leaving the screen.
   */
  const temporaryImageUri = useRef<string | null>(null);

  const clearTemporaryImage = useCallback(async () => {
    const uri = temporaryImageUri.current;

    if (!uri) {
      return;
    }

    try {
      await downloadService.deleteCachedFile(uri);
    } catch (cleanupError) {
      console.warn('Unable to remove temporary image:', cleanupError);
    }

    temporaryImageUri.current = null;
  }, [downloadService]);

  const loadImage = useCallback(async () => {
    // -----------------------------------------------------
    // Wait until network state is known.
    // -----------------------------------------------------

    if (!networkInitialized) {
      return;
    }

    if (!userId) {
      setLoading(false);

      setError('You must be logged in to view this image.');

      return;
    }

    try {
      setLoading(true);

      setError(null);

      setLoadedFromOfflineStorage(false);

      setImageUri(null);

      // ---------------------------------------------------
      // Remove previous temporary download only.
      // ---------------------------------------------------

      await clearTemporaryImage();

      //
      // We need the original file name so the offline
      // storage service can calculate the same deterministic
      // local path used when the image was persisted.
      //

      const cachedMaterials = await getMaterialsCache(userId, subjectId);

      const cachedMaterial = cachedMaterials.find(
        material => material.id === materialId,
      );

      const fileName = cachedMaterial?.fileName ?? `${materialId}.jpg`;

      // ===================================================
      // 1. CHECK PERMANENT OFFLINE COPY
      // ===================================================

      const persistedFile = await offlineFileStorageService.getPersistedFile({
        userId,

        subjectId,

        materialId,

        fileName,

        sourceType: 'image',
      });

      if (persistedFile) {
        setImageUri(persistedFile.localUri);

        setLoadedFromOfflineStorage(true);

        console.log('[IMAGE PREVIEW] Loaded from offline storage', {
          materialId,

          localPath: persistedFile.localPath,
        });

        return;
      }

      // ===================================================
      // 2. NO LOCAL COPY + OFFLINE
      // ===================================================

      if (!isOnline) {
        setError(
          'This image is not available offline yet. ' +
            'Connect to the internet and open it once ' +
            'to save an offline copy.',
        );

        return;
      }

      // ===================================================
      // 3. ONLINE DOWNLOAD
      // ===================================================

      const downloadedUri = await downloadService.download(materialId);

      // ===================================================
      // 4. SAVE PERMANENT OFFLINE COPY
      // ===================================================

      try {
        const permanentFile = await offlineFileStorageService.persistFile({
          userId,

          subjectId,

          materialId,

          sourceUri: downloadedUri,

          fileName,

          sourceType: 'image',
        });

        // -----------------------------------------------
        // Permanent copy exists now.
        // Temporary download can be removed.
        // -----------------------------------------------

        try {
          await downloadService.deleteCachedFile(downloadedUri);
        } catch (cleanupError) {
          console.warn('Temporary image cleanup failed:', cleanupError);
        }

        setImageUri(permanentFile.localUri);

        setLoadedFromOfflineStorage(true);

        console.log('[IMAGE PREVIEW] Downloaded and persisted', {
          materialId,

          localPath: permanentFile.localPath,
        });
      } catch (persistError) {
        /*
         * The download succeeded, so preview can still
         * work even if permanent persistence fails.
         *
         * Keep track of the temporary file and delete
         * it when this screen unmounts.
         */

        console.warn(
          'Unable to save permanent offline image copy:',
          persistError,
        );

        temporaryImageUri.current = downloadedUri;

        setImageUri(downloadedUri);

        setLoadedFromOfflineStorage(false);
      }
    } catch (loadError) {
      console.warn('Image preview error:', loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load image.',
      );
    } finally {
      setLoading(false);
    }
  }, [
    materialId,
    subjectId,
    userId,
    isOnline,
    networkInitialized,
    downloadService,
    clearTemporaryImage,
  ]);

  useEffect(() => {
    if (!networkInitialized) {
      return;
    }

    loadImage();
  }, [networkInitialized, loadImage]);

  //
  // IMPORTANT:
  //
  // Delete only temporary downloads.
  //
  // Never delete the permanent offline copy here.
  //

  useEffect(() => {
    return () => {
      const uri = temporaryImageUri.current;

      if (uri) {
        downloadService.deleteCachedFile(uri);
      }
    };
  }, [downloadService]);

  return (
    <ScreenContainer tone="dark" edges={['left', 'right', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-white/10 px-5 py-3">
        <View className="flex-row items-center">
          <FileImage size={16} color="#C4B5FD" />
          <Text className="ml-2 text-xs font-semibold text-violet-200">
            Image preview
          </Text>
        </View>
        {loadedFromOfflineStorage && !isOnline && (
          <View className="rounded-full bg-white/10 px-3 py-1.5">
            <Text className="text-[10px] font-semibold text-violet-200">
              Offline copy
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <ScreenState
          loading
          title="Loading image"
          description={
            isOnline
              ? 'Preparing your study material...'
              : 'Looking for an offline copy...'
          }
          dark
        />
      ) : error ? (
        <ScreenState
          title="Couldn't open image"
          description={error}
          icon={FileImage}
          iconColor="#C4B5FD"
          actionTitle={isOnline ? 'Try again' : undefined}
          onAction={isOnline ? loadImage : undefined}
          dark
        />
      ) : imageUri ? (
        <View className="flex-1 items-center justify-center p-3">
          <Image
            accessibilityLabel={route.params.title}
            source={{ uri: imageUri }}
            resizeMode="contain"
            className="h-full w-full rounded-2xl"
            onError={imageError => {
              console.warn('Image renderer error:', imageError.nativeEvent);
              setError(
                loadedFromOfflineStorage
                  ? 'The saved offline image could not be displayed.'
                  : 'The image could not be displayed.',
              );
            }}
          />
        </View>
      ) : (
        <ScreenState
          title="Image unavailable"
          description="No image is available for this material."
          icon={FileImage}
          iconColor="#C4B5FD"
          dark
        />
      )}
    </ScreenContainer>
  );
};

export default ImagePreviewScreen;
