import { SubjectApiRepositoryImpl } from '../../src/data/repositories/SubjectApiRepositoryImpl';
import { MaterialApiRepositoryImpl } from '../../src/data/repositories/MaterialApiRepositoryImpl';
import * as queue from '../../src/data/local/sync/pendingSyncQueue';
import { PendingSyncOperation } from '../../src/data/local/sync/pendingSyncQueue';
import { SyncSession } from '../../src/domain/models/SyncSession';
import { Material } from '../../src/domain/models/Material';
import { OfflineSyncService } from '../../src/services/offline/OfflineSyncService';

jest.mock('../../src/data/repositories/SubjectApiRepositoryImpl', () => ({
  SubjectApiRepositoryImpl: jest.fn(),
}));
jest.mock('../../src/data/repositories/MaterialApiRepositoryImpl', () => ({
  MaterialApiRepositoryImpl: jest.fn(),
}));
jest.mock('../../src/data/local/storage/offlineCache', () => ({
  getSubjectsCache: jest.fn(async () => []),
  saveSubjectsCache: jest.fn(),
  getMaterialsCache: jest.fn(async () => []),
  saveMaterialsCache: jest.fn(),
  updateMaterialsCache: jest.fn(async (
    _userId: string | number,
    _subjectId: string | number,
    update: (materials: Material[]) => Material[] | Promise<Material[]>,
  ) => update([])),
  removeMaterialsCache: jest.fn(),
}));
jest.mock('../../src/data/local/sync/pendingSyncQueue', () => ({
  getPendingSyncOperations: jest.fn(),
  markSyncOperationFailed: jest.fn(),
  removeSyncOperation: jest.fn(),
  replaceLocalEntityIdInQueue: jest.fn(),
}));
jest.mock('../../src/services/offline/OfflineFileStorageService', () => ({
  offlineFileStorageService: {
    persistFile: jest.fn(),
    deleteFile: jest.fn(),
  },
}));

type RecordedRequest = {
  accessToken: string | undefined;
  entity: 'subject' | 'material';
  entityId: string;
};

let pendingByUser: Map<string, PendingSyncOperation[]>;
let requests: RecordedRequest[];
let beforeSubjectResponse: (entityId: string) => Promise<void>;

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(complete => {
    resolve = complete;
  });
  return { promise, resolve };
};

const subjectUpdate = (
  userId: string,
  subjectId: string,
): PendingSyncOperation => ({
  id: `subject-update-${subjectId}`,
  userId,
  entity: 'subject',
  action: 'update',
  payload: { subjectId, name: `Subject ${subjectId}` },
  createdAt: 1,
  attempts: 0,
});

const materialUpdate = (
  userId: string,
  materialId: string,
): PendingSyncOperation => ({
  id: `material-update-${materialId}`,
  userId,
  entity: 'material',
  action: 'update',
  payload: {
    subjectId: `subject-${userId}`,
    materialId,
    title: `Material ${materialId}`,
    content: 'Saved offline notes',
  },
  createdAt: 2,
  attempts: 0,
});

const makeSession = (userId: string, accessToken: string) => {
  let current = true;
  const session: SyncSession = {
    userId,
    accessToken,
    isCurrent: () => current,
  };
  return {
    session,
    invalidate: () => {
      current = false;
    },
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  pendingByUser = new Map();
  requests = [];
  beforeSubjectResponse = async () => {};

  jest
    .mocked(queue.getPendingSyncOperations)
    .mockImplementation(async userId => [
      ...(pendingByUser.get(String(userId)) ?? []),
    ]);
  jest
    .mocked(queue.removeSyncOperation)
    .mockImplementation(async (userId, id) => {
      pendingByUser.set(
        String(userId),
        (pendingByUser.get(String(userId)) ?? []).filter(
          item => item.id !== id,
        ),
      );
    });

  jest.mocked(SubjectApiRepositoryImpl).mockImplementation(
    accessToken =>
      ({
        updateSubject: jest.fn(async (entityId: string) => {
          requests.push({ accessToken, entity: 'subject', entityId });
          await beforeSubjectResponse(entityId);
        }),
      } as unknown as SubjectApiRepositoryImpl),
  );
  jest.mocked(MaterialApiRepositoryImpl).mockImplementation(
    accessToken =>
      ({
        updateMaterial: jest.fn(async (entityId: string) => {
          requests.push({ accessToken, entity: 'material', entityId });
        }),
      } as unknown as MaterialApiRepositoryImpl),
  );
});

test('rejects a session belonging to another account before touching its queue', async () => {
  const { session } = makeSession('account-b', 'token-b');

  await expect(
    new OfflineSyncService().sync('account-a', session),
  ).rejects.toThrow('The sync session does not belong to this account.');

  expect(queue.getPendingSyncOperations).not.toHaveBeenCalled();
  expect(requests).toEqual([]);
  expect(queue.removeSyncOperation).not.toHaveBeenCalled();
});

test('an invalidated session leaves its pending operation available for a later valid session', async () => {
  const operation = subjectUpdate('account-a', '11');
  pendingByUser.set('account-a', [operation]);
  const { session, invalidate } = makeSession('account-a', 'token-a');
  invalidate();

  const result = await new OfflineSyncService().sync('account-a', session);

  expect(result).toEqual({
    processed: 0,
    succeeded: 0,
    failed: 0,
    remaining: 1,
  });
  expect(requests).toEqual([]);
  expect(queue.removeSyncOperation).not.toHaveBeenCalled();
  expect(queue.markSyncOperationFailed).not.toHaveBeenCalled();
  expect(pendingByUser.get('account-a')).toEqual([operation]);
});

test('switching accounts while reading the queue never sends or marks an unsent operation as failed', async () => {
  const operation = subjectUpdate('account-a', '11');
  pendingByUser.set('account-a', [operation]);
  const reading = deferred<PendingSyncOperation[]>();
  jest
    .mocked(queue.getPendingSyncOperations)
    .mockReturnValueOnce(reading.promise);
  const { session, invalidate } = makeSession('account-a', 'token-a');
  const syncing = new OfflineSyncService().sync('account-a', session);

  invalidate();
  reading.resolve([operation]);
  const result = await syncing;

  expect(result).toEqual({
    processed: 0,
    succeeded: 0,
    failed: 0,
    remaining: 1,
  });
  expect(requests).toEqual([]);
  expect(queue.removeSyncOperation).not.toHaveBeenCalled();
  expect(queue.markSyncOperationFailed).not.toHaveBeenCalled();
  expect(pendingByUser.get('account-a')).toEqual([operation]);
});

test('an in-flight request finishes with its captured token and account switch prevents the next request', async () => {
  const first = subjectUpdate('account-a', '11');
  const second = materialUpdate('account-a', '12');
  pendingByUser.set('account-a', [first, second]);
  const response = deferred<void>();
  const sent = deferred<void>();
  beforeSubjectResponse = async () => {
    sent.resolve();
    await response.promise;
  };
  const { session, invalidate } = makeSession('account-a', 'token-a');
  const syncing = new OfflineSyncService().sync('account-a', session);
  await sent.promise;

  invalidate();
  response.resolve();
  const result = await syncing;

  expect(requests).toEqual([
    { accessToken: 'token-a', entity: 'subject', entityId: '11' },
  ]);
  expect(result).toEqual({
    processed: 1,
    succeeded: 1,
    failed: 0,
    remaining: 1,
  });
  expect(queue.removeSyncOperation).toHaveBeenCalledWith('account-a', first.id);
  expect(queue.markSyncOperationFailed).not.toHaveBeenCalled();
  expect(pendingByUser.get('account-a')).toEqual([second]);
});

test('overlapping runs keep both subject and material requests bound to their own captured tokens', async () => {
  pendingByUser.set('account-a', [
    subjectUpdate('account-a', '11'),
    materialUpdate('account-a', '12'),
  ]);
  pendingByUser.set('account-b', [
    subjectUpdate('account-b', '21'),
    materialUpdate('account-b', '22'),
  ]);
  const firstResponse = deferred<void>();
  const firstSent = deferred<void>();
  beforeSubjectResponse = async entityId => {
    if (entityId === '11') {
      firstSent.resolve();
      await firstResponse.promise;
    }
  };
  const service = new OfflineSyncService();
  const accountA = makeSession('account-a', 'token-a');
  const accountB = makeSession('account-b', 'token-b');
  const firstRun = service.sync('account-a', accountA.session);
  await firstSent.promise;

  await service.sync('account-b', accountB.session);
  firstResponse.resolve();
  await firstRun;

  expect(requests).toEqual([
    { accessToken: 'token-a', entity: 'subject', entityId: '11' },
    { accessToken: 'token-b', entity: 'subject', entityId: '21' },
    { accessToken: 'token-b', entity: 'material', entityId: '22' },
    { accessToken: 'token-a', entity: 'material', entityId: '12' },
  ]);
  expect(SubjectApiRepositoryImpl).toHaveBeenCalledWith('token-a');
  expect(SubjectApiRepositoryImpl).toHaveBeenCalledWith('token-b');
  expect(MaterialApiRepositoryImpl).toHaveBeenCalledWith('token-a');
  expect(MaterialApiRepositoryImpl).toHaveBeenCalledWith('token-b');
  expect(queue.markSyncOperationFailed).not.toHaveBeenCalled();
  expect(pendingByUser.get('account-a')).toEqual([]);
  expect(pendingByUser.get('account-b')).toEqual([]);
});
