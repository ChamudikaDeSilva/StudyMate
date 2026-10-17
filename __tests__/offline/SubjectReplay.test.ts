import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getSubjectsCache,
  saveSubjectsCache,
  updateSubjectsCache,
} from '../../src/data/local/storage/offlineCache';
import {
  enqueueSyncOperation,
  getPendingSyncOperations,
} from '../../src/data/local/sync/pendingSyncQueue';
import {SubjectApiRepositoryImpl} from '../../src/data/repositories/SubjectApiRepositoryImpl';
import {Subject} from '../../src/domain/models/Subject';
import {SyncSession} from '../../src/domain/models/SyncSession';
import {OfflineSyncService} from '../../src/services/offline/OfflineSyncService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn()},
}));
jest.mock('../../src/data/repositories/SubjectApiRepositoryImpl', () => ({
  SubjectApiRepositoryImpl: jest.fn(),
}));
jest.mock('../../src/data/repositories/MaterialApiRepositoryImpl', () => ({
  MaterialApiRepositoryImpl: jest.fn(),
}));
jest.mock('../../src/services/offline/OfflineFileStorageService', () => ({
  offlineFileStorageService: {persistFile: jest.fn(), deleteFile: jest.fn()},
}));

const storage = new Map<string, string>();
const createSubject = jest.fn();
const updateSubject = jest.fn();
const deleteSubject = jest.fn();
const session: SyncSession = {
  userId: '7',
  accessToken: 'account-seven-session',
  isCurrent: () => true,
};
const subject = (id: string, overrides: Partial<Subject> = {}): Subject => ({
  id,
  userId: '7',
  name: 'Original name',
  description: 'Original description',
  createdAt: 1,
  updatedAt: 1,
  syncStatus: 'synced',
  ...overrides,
});
const updateInput = (subjectId: string, name = 'First edit', description = 'First description') => ({
  entity: 'subject',
  action: 'update',
  payload: {subjectId, name, description},
} as const);
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>(complete => {
    resolve = complete;
  });
  return {promise, resolve};
};

beforeEach(() => {
  jest.resetAllMocks();
  storage.clear();
  jest.mocked(AsyncStorage.getItem).mockImplementation(async key => storage.get(key) ?? null);
  jest.mocked(AsyncStorage.setItem).mockImplementation(async (key, value) => {
    storage.set(key, value);
  });
  jest.mocked(AsyncStorage.removeItem).mockImplementation(async key => {
    storage.delete(key);
  });
  jest.mocked(SubjectApiRepositoryImpl).mockImplementation(() => ({
    createSubject, updateSubject, deleteSubject,
  } as unknown as SubjectApiRepositoryImpl));
  updateSubject.mockResolvedValue(undefined);
  deleteSubject.mockResolvedValue(undefined);
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test('a delayed replayed update retains a later edited name and description until that edit syncs', async () => {
  const firstSent = deferred();
  const firstResponse = deferred();
  const secondSent = deferred();
  const secondResponse = deferred();
  const calls: string[] = [];
  updateSubject.mockImplementationOnce(async () => {
    calls.push('first update');
    firstSent.resolve();
    await firstResponse.promise;
  }).mockImplementationOnce(async () => {
    calls.push('second update');
    secondSent.resolve();
    await secondResponse.promise;
  });
  await saveSubjectsCache('7', [subject('10', {
    name: 'First edit', description: 'First description', syncStatus: 'pending',
  })]);
  await enqueueSyncOperation('7', updateInput('10'));
  const syncing = new OfflineSyncService().sync('7', session);
  await firstSent.promise;
  const latest = subject('10', {
    name: 'Newest name', description: 'Newest description', updatedAt: 5, syncStatus: 'pending',
  });
  await updateSubjectsCache('7', async () => {
    await enqueueSyncOperation('7', updateInput('10', latest.name, latest.description));
    return [latest];
  });
  firstResponse.resolve();
  await secondSent.promise;

  try {
    expect(await getSubjectsCache('7')).toEqual([latest]);
    expect(updateSubject).toHaveBeenNthCalledWith(1, '10', {
      name: 'First edit', description: 'First description',
    });
    expect(updateSubject).toHaveBeenNthCalledWith(2, '10', {
      name: 'Newest name', description: 'Newest description',
    });
    expect(await getPendingSyncOperations('7')).toHaveLength(1);
  } finally {
    secondResponse.resolve();
  }

  expect(await syncing).toEqual({processed: 2, succeeded: 2, failed: 0, remaining: 0});
  expect(calls).toEqual(['first update', 'second update']);
  expect(await getSubjectsCache('7')).toEqual([{
    ...latest, syncStatus: 'synced', updatedAt: expect.any(Number),
  }]);
  expect(await getPendingSyncOperations('7')).toEqual([]);
});

test('finishing an older update does not resurrect a subject with a later queued deletion', async () => {
  const updateSent = deferred();
  const updateResponse = deferred();
  const deleteSent = deferred();
  const deleteResponse = deferred();
  const calls: string[] = [];
  updateSubject.mockImplementationOnce(async () => {
    calls.push('update');
    updateSent.resolve();
    await updateResponse.promise;
  });
  deleteSubject.mockImplementationOnce(async () => {
    calls.push('delete');
    deleteSent.resolve();
    await deleteResponse.promise;
  });
  await saveSubjectsCache('7', [subject('10', {name: 'First edit', syncStatus: 'pending'})]);
  await enqueueSyncOperation('7', updateInput('10'));
  const syncing = new OfflineSyncService().sync('7', session);
  await updateSent.promise;
  await updateSubjectsCache('7', async () => {
    await enqueueSyncOperation('7', {
      entity: 'subject', action: 'delete', payload: {subjectId: '10'},
    });
    return [];
  });
  updateResponse.resolve();
  await deleteSent.promise;

  try {
    expect(await getSubjectsCache('7')).toEqual([]);
    expect(deleteSubject).toHaveBeenCalledWith('10');
    expect(calls).toEqual(['update', 'delete']);
    expect(await getPendingSyncOperations('7')).toEqual([
      expect.objectContaining({action: 'delete', payload: {subjectId: '10'}}),
    ]);
  } finally {
    deleteResponse.resolve();
  }

  expect(await syncing).toEqual({processed: 2, succeeded: 2, failed: 0, remaining: 0});
  expect(await getSubjectsCache('7')).toEqual([]);
  expect(await getPendingSyncOperations('7')).toEqual([]);
});

test('a local create followed by an edit keeps its latest values while remapping to the server ID', async () => {
  const updateSent = deferred();
  const updateResponse = deferred();
  const localId = 'local-subject-10';
  const latest = subject(localId, {
    name: 'Newest offline name', description: 'Newest offline description',
    updatedAt: 5, syncStatus: 'pending',
  });
  createSubject.mockResolvedValueOnce(subject('31'));
  updateSubject.mockImplementationOnce(async () => {
    updateSent.resolve();
    await updateResponse.promise;
  });
  await saveSubjectsCache('7', [latest]);
  await enqueueSyncOperation('7', {
    entity: 'subject', action: 'create',
    payload: {localId, name: 'Original name', description: 'Original description'},
  });
  await enqueueSyncOperation('7', updateInput(localId, latest.name, latest.description));
  const syncing = new OfflineSyncService().sync('7', session);
  await updateSent.promise;

  try {
    expect(createSubject).toHaveBeenCalledWith({
      userId: '7', name: 'Original name', description: 'Original description',
    });
    expect(updateSubject).toHaveBeenCalledWith('31', {
      name: latest.name, description: latest.description,
    });
    expect(await getSubjectsCache('7')).toEqual([{...latest, id: '31'}]);
    expect(await getPendingSyncOperations('7')).toEqual([
      expect.objectContaining({
        action: 'update',
        payload: {subjectId: '31', name: latest.name, description: latest.description},
      }),
    ]);
  } finally {
    updateResponse.resolve();
  }

  expect(await syncing).toEqual({processed: 2, succeeded: 2, failed: 0, remaining: 0});
  expect(await getSubjectsCache('7')).toEqual([{
    ...latest, id: '31', syncStatus: 'synced', updatedAt: expect.any(Number),
  }]);
  expect(await getPendingSyncOperations('7')).toEqual([]);
});
