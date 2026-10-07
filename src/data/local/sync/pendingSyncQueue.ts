import AsyncStorage
  from '@react-native-async-storage/async-storage';


// ============================================================
// OPERATION TYPES
// ============================================================

export type SyncEntity =
  | 'subject'
  | 'material';


export type SyncAction =
  | 'create'
  | 'update'
  | 'delete';


// ============================================================
// PAYLOADS
// ============================================================

export interface SubjectCreatePayload {
  localId: string;
  name: string;
  description?: string;
}


export interface SubjectUpdatePayload {
  subjectId: string;
  name: string;
  description?: string;
}


export interface SubjectDeletePayload {
  subjectId: string;
}


export interface MaterialCreatePayload {
  localId: string;
  subjectId: string;
  title: string;
  content: string;
}


export interface MaterialUpdatePayload {
  materialId: string;
  subjectId: string;
  title: string;
  content: string;
}


export interface MaterialDeletePayload {
  materialId: string;
  subjectId: string;
}


// ============================================================
// PAYLOAD UNION
// ============================================================

export type PendingSyncPayload =
  | SubjectCreatePayload
  | SubjectUpdatePayload
  | SubjectDeletePayload
  | MaterialCreatePayload
  | MaterialUpdatePayload
  | MaterialDeletePayload;


// ============================================================
// QUEUE ITEM
// ============================================================

export interface PendingSyncOperation {

  id:
    string;

  userId:
    string;

  entity:
    SyncEntity;

  action:
    SyncAction;

  payload:
    PendingSyncPayload;

  createdAt:
    number;

  attempts:
    number;

  lastError?:
    string;
}


// ============================================================
// ENQUEUE INPUT
// ============================================================

export interface EnqueueSyncOperationInput {

  entity:
    SyncEntity;

  action:
    SyncAction;

  payload:
    PendingSyncPayload;
}


// ============================================================
// STORAGE
// ============================================================

const QUEUE_PREFIX =
  'learnloop:offline:v1';


// ============================================================
// STORAGE KEY
// ============================================================

const queueKey =
  (
    userId:
      string | number,
  ): string => {

    return (
      `${QUEUE_PREFIX}`
      + `:user:${userId}`
      + ':syncQueue'
    );
  };


// ============================================================
// RANDOM ID HELPER
// ============================================================

const randomPart =
  (): string => {

    return Math
      .random()
      .toString(36)
      .slice(
        2,
        9,
      );
  };


// ============================================================
// SYNC OPERATION ID
// ============================================================

export const createSyncOperationId =
  (): string => {

    return (
      'sync-'
      + Date.now()
      + '-'
      + randomPart()
    );
  };


// ============================================================
// LOCAL ENTITY ID
// ============================================================
//
// Used for objects created offline.
//
// Example:
//
// local-subject-...
// local-material-...
//

export const createLocalEntityId =
  (
    entity:
      SyncEntity,
  ): string => {

    return (
      'local-'
      + entity
      + '-'
      + Date.now()
      + '-'
      + randomPart()
    );
  };


// ============================================================
// CHECK LOCAL ID
// ============================================================

export const isLocalEntityId =
  (
    id:
      string,
  ): boolean => {

    return id.startsWith(
      'local-',
    );
  };


// ============================================================
// READ QUEUE
// ============================================================

export const getPendingSyncOperations =
  async (
    userId:
      string | number,
  ): Promise<
    PendingSyncOperation[]
  > => {

    try {

      const raw =
        await AsyncStorage.getItem(
          queueKey(
            userId,
          ),
        );


      if (
        !raw
      ) {

        return [];
      }


      const parsed =
        JSON.parse(
          raw,
        );


      if (
        !Array.isArray(
          parsed,
        )
      ) {

        return [];
      }


      return (
        parsed as PendingSyncOperation[]
      ).sort(
        (
          a,
          b,
        ) =>
          a.createdAt
          -
          b.createdAt,
      );

    } catch (error) {

      console.warn(
        'Unable to read sync queue:',
        error,
      );


      return [];
    }
  };


// ============================================================
// SAVE QUEUE
// ============================================================

const savePendingSyncOperations =
  async (
    userId:
      string | number,

    operations:
      PendingSyncOperation[],
  ): Promise<void> => {

    try {

      await AsyncStorage.setItem(
        queueKey(
          userId,
        ),

        JSON.stringify(
          operations,
        ),
      );

    } catch (error) {

      console.warn(
        'Unable to save sync queue:',
        error,
      );


      throw error;
    }
  };


// ============================================================
// ENQUEUE
// ============================================================

export const enqueueSyncOperation =
  async (
    userId:
      string | number,

    input:
      EnqueueSyncOperationInput,
  ): Promise<
    PendingSyncOperation
  > => {

    const normalizedUserId =
      String(
        userId,
      );


    const current =
      await getPendingSyncOperations(
        normalizedUserId,
      );


    const operation:
      PendingSyncOperation = {

        id:
          createSyncOperationId(),

        userId:
          normalizedUserId,

        entity:
          input.entity,

        action:
          input.action,

        payload:
          input.payload,

        createdAt:
          Date.now(),

        attempts:
          0,
      };


    const next = [
      ...current,
      operation,
    ];


    await savePendingSyncOperations(
      normalizedUserId,
      next,
    );


    console.log(
      '[SYNC QUEUE] Added',
      {
        id:
          operation.id,

        entity:
          operation.entity,

        action:
          operation.action,
      },
    );


    return operation;
  };


// ============================================================
// REMOVE ONE OPERATION
// ============================================================

export const removeSyncOperation =
  async (
    userId:
      string | number,

    operationId:
      string,
  ): Promise<void> => {

    const current =
      await getPendingSyncOperations(
        userId,
      );


    const next =
      current.filter(
        operation =>
          operation.id !==
          operationId,
      );


    await savePendingSyncOperations(
      userId,
      next,
    );


    console.log(
      '[SYNC QUEUE] Removed',
      operationId,
    );
  };


// ============================================================
// UPDATE ONE OPERATION
// ============================================================

export const updateSyncOperation =
  async (
    userId:
      string | number,

    operationId:
      string,

    updater:
      (
        operation:
          PendingSyncOperation,
      ) =>
        PendingSyncOperation,
  ): Promise<void> => {

    const current =
      await getPendingSyncOperations(
        userId,
      );


    const next =
      current.map(
        operation => {

          if (
            operation.id !==
            operationId
          ) {

            return operation;
          }


          return updater(
            operation,
          );
        },
      );


    await savePendingSyncOperations(
      userId,
      next,
    );
  };


// ============================================================
// MARK FAILURE
// ============================================================

export const markSyncOperationFailed =
  async (
    userId:
      string | number,

    operationId:
      string,

    error:
      unknown,
  ): Promise<void> => {

    const message =
      error instanceof Error
        ? error.message
        : 'Sync failed.';


    await updateSyncOperation(
      userId,
      operationId,
      operation => ({
        ...operation,

        attempts:
          operation.attempts
          + 1,

        lastError:
          message,
      }),
    );


    console.warn(
      '[SYNC QUEUE] Operation failed',
      {
        operationId,
        message,
      },
    );
  };


// ============================================================
// QUEUE COUNT
// ============================================================

export const getPendingSyncCount =
  async (
    userId:
      string | number,
  ): Promise<
    number
  > => {

    const operations =
      await getPendingSyncOperations(
        userId,
      );


    return operations.length;
  };


// ============================================================
// FIND CREATE OPERATION FOR LOCAL ENTITY
// ============================================================

export const findPendingCreateOperation =
  async (
    userId:
      string | number,

    entity:
      SyncEntity,

    localId:
      string,
  ): Promise<
    PendingSyncOperation | null
  > => {

    const operations =
      await getPendingSyncOperations(
        userId,
      );


    const result =
      operations.find(
        operation => {

          if (
            operation.entity !==
              entity
            ||
            operation.action !==
              'create'
          ) {

            return false;
          }


          const payload =
            operation.payload;


          if (
            !(
              'localId'
              in
              payload
            )
          ) {

            return false;
          }


          return (
            payload.localId ===
            localId
          );
        },
      );


    return (
      result
      ??
      null
    );
  };


// ============================================================
// REPLACE LOCAL ENTITY ID IN QUEUE
// ============================================================
//
// After an offline-created object reaches
// FastAPI, the temporary local ID becomes
// a real server ID.
//
// Example:
//
// local-material-123
//
// becomes:
//
// 45
//
// Later queued operations must use 45.
//

export const replaceLocalEntityIdInQueue =
  async (
    userId:
      string | number,

    localId:
      string,

    serverId:
      string,
  ): Promise<void> => {

    const current =
      await getPendingSyncOperations(
        userId,
      );


    const next =
      current.map(
        operation => {

          const payload =
            operation.payload;


          // ===================================================
          // SUBJECT ID
          // ===================================================

          if (
            'subjectId'
            in
            payload
            &&
            payload.subjectId ===
            localId
          ) {

            return {
              ...operation,

              payload: {
                ...payload,

                subjectId:
                  serverId,
              },
            };
          }


          // ===================================================
          // MATERIAL ID
          // ===================================================

          if (
            'materialId'
            in
            payload
            &&
            payload.materialId ===
            localId
          ) {

            return {
              ...operation,

              payload: {
                ...payload,

                materialId:
                  serverId,
              },
            };
          }


          return operation;
        },
      );


    await savePendingSyncOperations(
      userId,
      next,
    );


    console.log(
      '[SYNC QUEUE] Local ID replaced',
      {
        localId,
        serverId,
      },
    );
  };


// ============================================================
// REMOVE OPERATIONS FOR LOCAL ENTITY
// ============================================================
//
// Example:
//
// User creates a material offline.
//
// CREATE local-material-123
//
// Before reconnecting, user deletes it.
//
// We do not need:
//
// CREATE -> FastAPI
// DELETE -> FastAPI
//
// We can simply remove those queued
// operations.
//

export const removeLocalEntityOperations =
  async (
    userId:
      string | number,

    localId:
      string,
  ): Promise<void> => {

    const current =
      await getPendingSyncOperations(
        userId,
      );


    const next =
      current.filter(
        operation => {

          const payload =
            operation.payload;


          const matchesLocalId =
            (
              'localId'
              in
              payload
              &&
              payload.localId ===
              localId
            );


          const matchesSubjectId =
            (
              'subjectId'
              in
              payload
              &&
              payload.subjectId ===
              localId
            );


          const matchesMaterialId =
            (
              'materialId'
              in
              payload
              &&
              payload.materialId ===
              localId
            );


          return !(
            matchesLocalId
            ||
            matchesSubjectId
            ||
            matchesMaterialId
          );
        },
      );


    await savePendingSyncOperations(
      userId,
      next,
    );


    console.log(
      '[SYNC QUEUE] Local entity operations removed',
      localId,
    );
  };


// ============================================================
// CLEAR QUEUE
// ============================================================

export const clearPendingSyncQueue =
  async (
    userId:
      string | number,
  ): Promise<void> => {

    try {

      await AsyncStorage.removeItem(
        queueKey(
          userId,
        ),
      );


      console.log(
        '[SYNC QUEUE] Cleared for user',
        userId,
      );

    } catch (error) {

      console.warn(
        'Unable to clear sync queue:',
        error,
      );
    }
  };


// ============================================================
// DEBUG
// ============================================================

export const logPendingSyncQueue =
  async (
    userId:
      string | number,
  ): Promise<void> => {

    const operations =
      await getPendingSyncOperations(
        userId,
      );


    console.log(
      '[SYNC QUEUE] Current queue',
      operations,
    );
  };