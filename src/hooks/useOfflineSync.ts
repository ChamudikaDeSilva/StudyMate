import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  getPendingSyncCount,
  subscribeToSyncQueue,
} from '../data/local/sync/pendingSyncQueue';

import {
  OfflineSyncResult,
  offlineSyncService,
} from '../services/offline/OfflineSyncService';

import {
  useAuth,
} from './useAuth';

import {
  useNetwork,
} from './useNetwork';


export const useOfflineSync = () => {
  const {
    user,
    sessionValidated,
    getSyncSession,
  } = useAuth();


  const {
    isOnline,
    initialized:
      networkInitialized,
  } = useNetwork();


  const [
    syncing,
    setSyncing,
  ] = useState(false);


  const [
    lastResult,
    setLastResult,
  ] = useState<
    OfflineSyncResult | null
  >(null);


  const syncingRef =
    useRef(false);
  const syncNowRef = useRef<(() => Promise<OfflineSyncResult | null>) | null>(null);
  const queuedDuringSync = useRef(false);


  const userId =
    user
      ? String(user.id)
      : null;


  // =========================================================
  // RUN SYNC
  // =========================================================

  const syncNow =
    useCallback(
      async () => {

        if (
          !userId
          ||
          !sessionValidated
          ||
          !networkInitialized
          ||
          !isOnline
          ||
          syncingRef.current
        ) {
          return null;
        }

        const session = getSyncSession();
        if (!session || session.userId !== userId || !session.isCurrent()) {
          return null;
        }

        try {
          syncingRef.current =
            true;
          queuedDuringSync.current = false;

          setSyncing(
            true,
          );


          const pendingCount =
            await getPendingSyncCount(
              userId,
            );


          /*
           * Nothing waiting.
           *
           * Avoid unnecessary API / sync work.
           */
          if (
            !session.isCurrent() || pendingCount === 0
          ) {
            return null;
          }


          console.log(
            '[OFFLINE SYNC] Pending operations detected',
            {
              pendingCount,
            },
          );


          const result =
            await offlineSyncService
              .sync(
                userId,
                session,
              );


          if (session.isCurrent()) {
            setLastResult(result);
          }


          return result;

        } catch (error) {
          console.warn(
            '[OFFLINE SYNC] Automatic sync failed:',
            error,
          );


          return null;

        } finally {
          syncingRef.current =
            false;

          setSyncing(
            false,
          );

          const currentSession = getSyncSession();
          if (
            currentSession?.isCurrent() &&
            (!session.isCurrent() || queuedDuringSync.current)
          ) {
            queuedDuringSync.current = false;
            syncNowRef.current?.();
          }
        }
      },
      [
        userId,
        sessionValidated,
        getSyncSession,
        networkInitialized,
        isOnline,
      ],
    );

  syncNowRef.current = syncNow;

  useEffect(() => subscribeToSyncQueue(queuedUserId => {
    if (queuedUserId !== userId) {
      return;
    }
    queuedDuringSync.current = true;
    syncNowRef.current?.();
  }), [userId]);

  useEffect(() => {
    setLastResult(null);
  }, [userId]);


  // =========================================================
  // AUTO SYNC
  // =========================================================
  //
  // Runs:
  //
  // App starts while online
  //          OR
  // Offline -> Online
  //
  // If the queue is empty,
  // nothing happens.
  //

  useEffect(
    () => {

      if (
        !userId
        ||
        !sessionValidated
        ||
        !networkInitialized
        ||
        !isOnline
      ) {
        return;
      }


      syncNow();

    },
    [
      userId,
      sessionValidated,
      networkInitialized,
      isOnline,
      syncNow,
    ],
  );


  return {
    syncing,
    lastResult,
    syncNow,
  };
};
