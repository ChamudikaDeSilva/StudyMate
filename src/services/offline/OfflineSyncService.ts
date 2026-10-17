import {
  SubjectApiRepositoryImpl,
} from '../../data/repositories/SubjectApiRepositoryImpl';

import {
  MaterialApiRepositoryImpl,
} from '../../data/repositories/MaterialApiRepositoryImpl';

import {
  updateSubjectsCache,
  getMaterialsCache,
  saveMaterialsCache,
  updateMaterialsCache,
  removeMaterialsCache,
} from '../../data/local/storage/offlineCache';

import {
  getPendingSyncOperations,
  markSyncOperationFailed,
  removeSyncOperation,
  replaceLocalEntityIdInQueue,

  PendingSyncOperation,

  SubjectCreatePayload,
  SubjectUpdatePayload,
  SubjectDeletePayload,

  MaterialCreatePayload,
  MaterialFileCreatePayload,
  MaterialUpdatePayload,
  MaterialDeletePayload,
} from '../../data/local/sync/pendingSyncQueue';

import {
  offlineFileStorageService,
} from './OfflineFileStorageService';
import {SyncSession} from '../../domain/models/SyncSession';
import {Material} from '../../domain/models/Material';


// ============================================================
// RESULT
// ============================================================

export interface OfflineSyncResult {

  processed:
    number;

  succeeded:
    number;

  failed:
    number;

  remaining:
    number;
}


// ============================================================
// SERVICE
// ============================================================

export class OfflineSyncService {
  async sync(
    userId: string | number,
    session: SyncSession,
  ): Promise<OfflineSyncResult> {
    const normalizedUserId = String(userId);
    if (session.userId !== normalizedUserId) {
      throw new Error('The sync session does not belong to this account.');
    }

    // Every run keeps its original credentials, even if the active account changes.
    return new OfflineSyncRun(session.accessToken).sync(normalizedUserId, session);
  }
}

class OfflineSyncRun {

  private readonly subjectRepository: SubjectApiRepositoryImpl;


  private readonly materialRepository: MaterialApiRepositoryImpl;

  constructor(accessToken: string) {
    this.subjectRepository = new SubjectApiRepositoryImpl(accessToken);
    this.materialRepository = new MaterialApiRepositoryImpl(accessToken);
  }


  // =========================================================
  // SYNC
  // =========================================================

  async sync(
    userId:
      string | number,
    session: SyncSession,
  ): Promise<
    OfflineSyncResult
  > {

    const normalizedUserId =
      String(
        userId,
      );


    let processed =
      0;

    let succeeded =
      0;

    let failed =
      0;


    console.log(
      '[OFFLINE SYNC] Starting',
      {
        userId:
          normalizedUserId,
      },
    );


    /*
     * IMPORTANT:
     *
     * Read the queue again after
     * every successful operation.
     *
     * Example:
     *
     * CREATE local-material-123
     *          ↓
     * server returns material 45
     *          ↓
     * queue IDs are changed to 45
     *          ↓
     * reread queue
     *          ↓
     * UPDATE material 45
     */

    while (session.isCurrent()) {

      const operations =
        await getPendingSyncOperations(
          normalizedUserId,
        );


      if (
        !session.isCurrent() ||
        operations.length ===
        0
      ) {

        break;
      }


      const operation =
        operations[0];

      if (!session.isCurrent()) {
        break;
      }

      processed +=
        1;


      try {

        console.log(
          '[OFFLINE SYNC] Processing',
          {
            operationId:
              operation.id,

            entity:
              operation.entity,

            action:
              operation.action,
          },
        );


        await this.processOperation(
          normalizedUserId,
          operation,
        );


        /*
         * processOperation() updates
         * local cache first.
         *
         * Only after all processing
         * succeeds do we remove the
         * queue item.
         */

        await removeSyncOperation(
          normalizedUserId,
          operation.id,
        );


        succeeded +=
          1;


        console.log(
          '[OFFLINE SYNC] Success',
          {
            operationId:
              operation.id,
          },
        );

      } catch (
        error
      ) {

        failed +=
          1;


        await markSyncOperationFailed(
          normalizedUserId,
          operation.id,
          error,
        );


        console.warn(
          '[OFFLINE SYNC] Stopped after failure',
          {
            operationId:
              operation.id,

            error,
          },
        );


        /*
         * Stop here.
         *
         * Later operations may depend
         * on this one.
         *
         * Example:
         *
         * CREATE subject
         * CREATE material for subject
         *
         * If subject creation fails,
         * material creation must not
         * continue.
         */

        break;
      }
    }


    const remainingOperations =
      await getPendingSyncOperations(
        normalizedUserId,
      );


    const result:
      OfflineSyncResult = {

        processed,

        succeeded,

        failed,

        remaining:
          remainingOperations.length,
      };


    console.log(
      '[OFFLINE SYNC] Finished',
      result,
    );


    return result;
  }


  // =========================================================
  // PROCESS ONE OPERATION
  // =========================================================

  private async processOperation(
    userId:
      string,

    operation:
      PendingSyncOperation,
  ): Promise<void> {

    // ========================================================
    // SUBJECT
    // ========================================================

    if (
      operation.entity ===
      'subject'
    ) {

      if (
        operation.action ===
        'create'
      ) {

        await this.createSubject(
          userId,
          operation,
        );

        return;
      }


      if (
        operation.action ===
        'update'
      ) {

        await this.updateSubject(
          userId,
          operation,
        );

        return;
      }


      if (
        operation.action ===
        'delete'
      ) {

        await this.deleteSubject(
          userId,
          operation,
        );

        return;
      }
    }


    // ========================================================
    // MATERIAL
    // ========================================================

    if (
      operation.entity ===
      'material'
    ) {

      if (
        operation.action ===
        'create'
      ) {

        if (
          this.isFileMaterialCreatePayload(
            operation,
          )
        ) {

          await this.createFileMaterial(
            userId,
            operation,
          );

          return;
        }


        await this.createMaterial(
          userId,
          operation,
        );

        return;
      }


      if (
        operation.action ===
        'update'
      ) {

        await this.updateMaterial(
          userId,
          operation,
        );

        return;
      }


      if (
        operation.action ===
        'delete'
      ) {

        await this.deleteMaterial(
          userId,
          operation,
        );

        return;
      }
    }


    throw new Error(
      'Unsupported offline sync operation.',
    );
  }


  // =========================================================
  // FILE MATERIAL TYPE GUARD
  // =========================================================

  private isFileMaterialCreatePayload(
    operation:
      PendingSyncOperation,
  ): boolean {

    const payload =
      operation.payload;


    return (
      'sourceType'
      in
      payload
      &&
      'localFilePath'
      in
      payload
      &&
      'fileName'
      in
      payload
      &&
      'mimeType'
      in
      payload
    );
  }


  // =========================================================
  // SUBJECT CREATE
  // =========================================================

  private async createSubject(
    userId:
      string,

    operation:
      PendingSyncOperation,
  ): Promise<void> {

    const payload =
      operation.payload as
        SubjectCreatePayload;


    const createdSubject =
      await this
        .subjectRepository
        .createSubject({
          userId,

          name:
            payload.name,

          description:
            payload.description,
        });


    const serverId =
      String(
        createdSubject.id,
      );


    // ========================================================
    // UPDATE SUBJECT CACHE
    // ========================================================

    await updateSubjectsCache(userId, async current => {
      const pending = await getPendingSyncOperations(userId);
      const position = pending.findIndex(item => item.id === operation.id);
      const later = pending.slice(position + 1).filter(item =>
        item.entity === 'subject' && 'subjectId' in item.payload &&
        (item.payload.subjectId === payload.localId || item.payload.subjectId === serverId),
      );
      const withoutLocal = current.filter(subject =>
        subject.id !== payload.localId && subject.id !== serverId,
      );
      if (later.some(item => item.action === 'delete')) {
        return withoutLocal;
      }
      const local = current.find(subject => subject.id === payload.localId);
      const syncedSubject = {
        ...createdSubject,
        ...(later.length && local ? {
          name: local.name,
          description: local.description,
          updatedAt: local.updatedAt,
        } : {}),
        syncStatus: later.length ? 'pending' as const : 'synced' as const,
      };
      return [syncedSubject, ...withoutLocal];
    });


    // ========================================================
    // MOVE MATERIAL CACHE
    // ========================================================
    //
    // A subject created offline may
    // already contain offline-created
    // text materials.
    //
    // Their cache currently lives under:
    //
    // local-subject-123
    //
    // Move that cache to:
    //
    // server subject ID
    //

    const localMaterials =
      await getMaterialsCache(
        userId,
        payload.localId,
      );


    if (
      localMaterials.length >
      0
    ) {

      const migratedMaterials =
        localMaterials.map(
          material => ({
            ...material,

            subjectId:
              serverId,
          }),
        );


      await saveMaterialsCache(
        userId,
        serverId,
        migratedMaterials,
      );
    }


    await removeMaterialsCache(
      userId,
      payload.localId,
    );


    // ========================================================
    // UPDATE LATER QUEUE OPERATIONS
    // ========================================================

    await replaceLocalEntityIdInQueue(
      userId,
      payload.localId,
      serverId,
    );


    console.log(
      '[OFFLINE SYNC] Subject created',
      {
        localId:
          payload.localId,

        serverId,
      },
    );
  }


  // =========================================================
  // SUBJECT UPDATE
  // =========================================================

  private async updateSubject(
    userId:
      string,

    operation:
      PendingSyncOperation,
  ): Promise<void> {

    const payload =
      operation.payload as
        SubjectUpdatePayload;


    await this
      .subjectRepository
      .updateSubject(
        payload.subjectId,
        {
          name:
            payload.name,

          description:
            payload.description,
        },
      );


    await updateSubjectsCache(userId, async current => {
      const pending = await getPendingSyncOperations(userId);
      const position = pending.findIndex(item => item.id === operation.id);
      const later = pending.slice(position + 1).filter(item =>
        item.entity === 'subject' && 'subjectId' in item.payload &&
        item.payload.subjectId === payload.subjectId,
      );
      if (later.some(item => item.action === 'delete')) {
        return current.filter(subject => subject.id !== payload.subjectId);
      }
      const lastUpdate = later.filter(item => item.action === 'update').at(-1);
      const values = lastUpdate?.payload as SubjectUpdatePayload | undefined;
      return current.map(subject => subject.id === payload.subjectId ? {
        ...subject,
        name: values?.name ?? payload.name,
        description: values ? values.description : payload.description,
        updatedAt: values ? subject.updatedAt : Date.now(),
        syncStatus: values ? 'pending' as const : 'synced' as const,
      } : subject);
    });


    console.log(
      '[OFFLINE SYNC] Subject updated',
      {
        subjectId:
          payload.subjectId,
      },
    );
  }


  // =========================================================
  // SUBJECT DELETE
  // =========================================================

  private async deleteSubject(
    userId:
      string,

    operation:
      PendingSyncOperation,
  ): Promise<void> {

    const payload =
      operation.payload as
        SubjectDeletePayload;


    await this
      .subjectRepository
      .deleteSubject(
        payload.subjectId,
      );


    await updateSubjectsCache(userId, current =>
      current.filter(subject => subject.id !== payload.subjectId),
    );


    await removeMaterialsCache(
      userId,
      payload.subjectId,
    );


    console.log(
      '[OFFLINE SYNC] Subject deleted',
      {
        subjectId:
          payload.subjectId,
      },
    );
  }


  // =========================================================
  // TEXT MATERIAL CREATE
  // =========================================================

  private async cacheCreatedMaterial(
    userId: string,
    operation: PendingSyncOperation,
    createdMaterial: Material,
  ): Promise<void> {
    const payload = operation.payload as MaterialCreatePayload | MaterialFileCreatePayload;
    await updateMaterialsCache(userId, payload.subjectId, async cachedMaterials => {
      const pending = await getPendingSyncOperations(userId);
      let material: Material = {...createdMaterial, syncStatus: 'synced'};
      let deleted = false;

      // Upload/create may finish before later edits can be sent. The local row
      // must retain those changes even if the following request needs a retry.
      for (const queued of pending) {
        if (
          queued.id === operation.id ||
          queued.entity !== 'material' ||
          !('materialId' in queued.payload) ||
          (queued.payload.materialId !== payload.localId &&
            queued.payload.materialId !== createdMaterial.id)
        ) {
          continue;
        }
        if (queued.action === 'delete') {
          deleted = true;
        } else if (queued.action === 'update') {
          const update = queued.payload as MaterialUpdatePayload;
          material = {
            ...material,
            title: update.title,
            ...(update.kind === 'title' ? {} : {content: update.content}),
            syncStatus: 'pending',
          };
        }
      }

      const withoutServerRow = cachedMaterials.filter(item => item.id !== createdMaterial.id);
      if (deleted) {
        return withoutServerRow.filter(item => item.id !== payload.localId);
      }
      return withoutServerRow.some(item => item.id === payload.localId)
        ? withoutServerRow.map(item => item.id === payload.localId ? material : item)
        : [material, ...withoutServerRow];
    });
  }

  private async createMaterial(
    userId:
      string,

    operation:
      PendingSyncOperation,
  ): Promise<void> {

    const payload =
      operation.payload as
        MaterialCreatePayload;


    // File creates are handled separately by createFileMaterial().

    const createdMaterial =
      await this
        .materialRepository
        .createMaterial({
          userId,

          subjectId:
            payload.subjectId,

          title:
            payload.title,

          sourceType:
            'text',

          content:
            payload.content,
        });


    const serverId =
      String(
        createdMaterial.id,
      );


    // ========================================================
    // UPDATE MATERIAL CACHE
    // ========================================================

    await this.cacheCreatedMaterial(userId, operation, createdMaterial);


    // ========================================================
    // UPDATE LATER QUEUE OPERATIONS
    // ========================================================

    await replaceLocalEntityIdInQueue(
      userId,
      payload.localId,
      serverId,
    );


    console.log(
      '[OFFLINE SYNC] Material created',
      {
        localId:
          payload.localId,

        serverId,
      },
    );
  }


  // =========================================================
  // FILE MATERIAL CREATE
  // =========================================================
  //
  // Supports queued:
  //   PDF
  //   Image
  //   Camera
  //
  // Camera currently uses the same existing backend image
  // upload endpoint, matching the app's current online flow.
  //

  private async createFileMaterial(
    userId:
      string,

    operation:
      PendingSyncOperation,
  ): Promise<void> {

    const payload =
      operation.payload as
        MaterialFileCreatePayload;


    const uploadUri =
      payload.localFilePath.startsWith(
        'file://',
      )
        ? payload.localFilePath
        : `file://${payload.localFilePath}`;


    // ========================================================
    // UPLOAD FILE TO FASTAPI
    // ========================================================

    const createdMaterial =
      payload.sourceType ===
      'pdf'

        ? await this
            .materialRepository
            .createPdfMaterial({
              userId,

              subjectId:
                payload.subjectId,

              title:
                payload.title,

              fileUri:
                uploadUri,

              fileName:
                payload.fileName,

              mimeType:
                payload.mimeType,
            })

        : await this
            .materialRepository
            .createImageMaterial({
              userId,

              subjectId:
                payload.subjectId,

              title:
                payload.title,

              fileUri:
                uploadUri,

              fileName:
                payload.fileName,

              mimeType:
                payload.mimeType,
            });


    const serverId =
      String(
        createdMaterial.id,
      );


    // ========================================================
    // UPDATE MATERIAL CACHE
    // ========================================================

    await this.cacheCreatedMaterial(userId, operation, createdMaterial);


    // ========================================================
    // MIGRATE PERSISTED FILE TO SERVER MATERIAL ID
    // ========================================================
    //
    // The file was persisted using the temporary local ID.
    // Once FastAPI returns the real ID, persist a copy under
    // the real server identity.
    //
    // Do not fail the completed server upload if this local
    // migration fails, otherwise retrying could create a
    // duplicate Material on the server.
    //

    try {

      const serverFile =
        await offlineFileStorageService
          .persistFile({
            userId,

            subjectId:
              payload.subjectId,

            materialId:
              serverId,

            sourceUri:
              uploadUri,

            fileName:
              payload.fileName,

            sourceType:
              payload.sourceType,
          });


      if (
        serverFile.localPath !==
        payload.localFilePath
      ) {

        try {

          await offlineFileStorageService
            .deleteFile(
              payload.localFilePath,
            );

        } catch (
          cleanupError
        ) {

          console.warn(
            '[OFFLINE SYNC] Old local file cleanup failed:',
            cleanupError,
          );
        }
      }

    } catch (
      migrationError
    ) {

      console.warn(
        '[OFFLINE SYNC] File uploaded, but offline-file migration failed:',
        migrationError,
      );
    }


    // ========================================================
    // UPDATE LATER QUEUE OPERATIONS
    // ========================================================

    await replaceLocalEntityIdInQueue(
      userId,
      payload.localId,
      serverId,
    );


    console.log(
      '[OFFLINE SYNC] File material created',
      {
        sourceType:
          payload.sourceType,

        localId:
          payload.localId,

        serverId,

        subjectId:
          payload.subjectId,
      },
    );
  }


  // =========================================================
  // MATERIAL UPDATE
  // =========================================================

  private async updateMaterial(
    userId:
      string,

    operation:
      PendingSyncOperation,
  ): Promise<void> {

    const payload =
      operation.payload as
        MaterialUpdatePayload;


    if (payload.kind === 'title') {
      await this.materialRepository.updateMaterialTitle(payload.materialId, payload.title);
    } else {
      // Existing stored text updates have no kind field.
      await this.materialRepository.updateMaterial(payload.materialId, {
        title: payload.title,
        content: payload.content,
      });
    }


    await updateMaterialsCache(userId, payload.subjectId, async cachedMaterials => {
      // A user can make another offline change while this request is in flight.
      // Completing an earlier edit must not roll that later change back locally.
      const pending = await getPendingSyncOperations(userId);
      const laterUpdates: MaterialUpdatePayload[] = [];
      let laterDelete = false;
      for (const queued of pending) {
        if (
          queued.id === operation.id ||
          queued.entity !== 'material' ||
          !('materialId' in queued.payload) ||
          queued.payload.materialId !== payload.materialId
        ) {
          continue;
        }
        if (queued.action === 'delete') {
          laterDelete = true;
        } else if (queued.action === 'update') {
          laterUpdates.push(queued.payload as MaterialUpdatePayload);
        }
      }

      return laterDelete
        ? cachedMaterials.filter(material => material.id !== payload.materialId)
        : cachedMaterials.map(material => {
            if (material.id !== payload.materialId) {
              return material;
            }

            let updated = {
              ...material,
              title: payload.title,
              ...(payload.kind === 'title' ? {} : {content: payload.content}),
              updatedAt: Date.now(),
              syncStatus: laterUpdates.length ? 'pending' as const : 'synced' as const,
            };
            for (const later of laterUpdates) {
              updated = {
                ...updated,
                title: later.title,
                ...(later.kind === 'title' ? {} : {content: later.content}),
              };
            }
            return updated;
          });
    });


    console.log(
      '[OFFLINE SYNC] Material updated',
      {
        materialId:
          payload.materialId,
      },
    );
  }


  // =========================================================
  // MATERIAL DELETE
  // =========================================================

  private async deleteMaterial(
    userId:
      string,

    operation:
      PendingSyncOperation,
  ): Promise<void> {

    const payload =
      operation.payload as
        MaterialDeletePayload;


    try {
      await this.materialRepository.deleteMaterial(payload.materialId);
    } catch (error) {
      // A previous attempt may have reached the server before its response was
      // lost. Already absent is the requested result; other failures must retry.
      if (!(error instanceof Error && 'status' in error && error.status === 404)) {
        throw error;
      }
    }


    await updateMaterialsCache(userId, payload.subjectId, cachedMaterials =>
      cachedMaterials.filter(material => material.id !== payload.materialId),
    );


    console.log(
      '[OFFLINE SYNC] Material deleted',
      {
        materialId:
          payload.materialId,
      },
    );
  }
}


// ============================================================
// SHARED INSTANCE
// ============================================================

export const offlineSyncService =
  new OfflineSyncService();
