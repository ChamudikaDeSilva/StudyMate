import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMaterialsCache,
  saveMaterialsCache,
} from '../../src/data/local/storage/offlineCache';
import {
  enqueueSyncOperation,
  getPendingSyncOperations,
} from '../../src/data/local/sync/pendingSyncQueue';
import {MaterialApiRepositoryImpl} from '../../src/data/repositories/MaterialApiRepositoryImpl';
import {Material} from '../../src/domain/models/Material';
import {SyncSession} from '../../src/domain/models/SyncSession';
import {OfflineSyncService} from '../../src/services/offline/OfflineSyncService';
import {offlineFileStorageService} from '../../src/services/offline/OfflineFileStorageService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
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
const createMaterial = jest.fn();
const createPdfMaterial = jest.fn();
const updateMaterial = jest.fn();
const updateMaterialTitle = jest.fn();
const deleteMaterial = jest.fn();
const session: SyncSession = {
  userId: '7',
  accessToken: 'account-seven-session',
  isCurrent: () => true,
};
const material = (id: string, overrides: Partial<Material> = {}): Material => ({
  id,
  userId: '7',
  subjectId: '10',
  sourceType: 'text',
  title: `Note ${id}`,
  content: 'Original note content',
  createdAt: 1,
  updatedAt: 1,
  syncStatus: 'synced',
  ...overrides,
});
const updateInput = (materialId: string, title = 'Edited note', content = 'Edited content') =>
  ({
    entity: 'material',
    action: 'update',
    payload: {materialId, subjectId: '10', title, content},
  } as const);
const deleteInput = (materialId: string) =>
  ({
    entity: 'material',
    action: 'delete',
    payload: {materialId, subjectId: '10'},
  } as const);
const titleInput = (materialId: string, title = 'Renamed file') =>
  ({
    entity: 'material',
    action: 'update',
    payload: {materialId, subjectId: '10', title, kind: 'title'},
  } as const);
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>(complete => {
    resolve = complete;
  });
  return {promise, resolve};
};
const httpError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), {status});

beforeEach(() => {
  jest.resetAllMocks();
  storage.clear();
  jest.mocked(AsyncStorage.getItem).mockImplementation(async key =>
    storage.get(key) ?? null,
  );
  jest.mocked(AsyncStorage.setItem).mockImplementation(async (key, value) => {
    storage.set(key, value);
  });
  jest.mocked(AsyncStorage.removeItem).mockImplementation(async key => {
    storage.delete(key);
  });
  jest.mocked(MaterialApiRepositoryImpl).mockImplementation(() => ({
    createMaterial,
    createPdfMaterial,
    updateMaterial,
    updateMaterialTitle,
    deleteMaterial,
  } as unknown as MaterialApiRepositoryImpl));
  updateMaterial.mockResolvedValue(undefined);
  updateMaterialTitle.mockResolvedValue(undefined);
  deleteMaterial.mockResolvedValue(undefined);
  jest.mocked(offlineFileStorageService.persistFile).mockResolvedValue({
    localPath: '/saved/server-file.pdf',
    localUri: 'file:///saved/server-file.pdf',
    fileName: 'study.pdf',
    sourceType: 'pdf',
  });
});

test.each(['pdf', 'image', 'camera'] as const)(
  'replays an offline %s title change without altering file metadata or extracted text',
  async sourceType => {
    const original = material('21', {
      sourceType,
      title: 'Renamed file',
      content: 'Previously extracted study content',
      fileName: sourceType === 'pdf' ? 'study.pdf' : 'study.jpg',
      fileUrl: 'file:///saved/study-file',
      syncStatus: 'pending',
    });
    await saveMaterialsCache('7', '10', [original]);
    await enqueueSyncOperation('7', titleInput('21'));

    const result = await new OfflineSyncService().sync('7', session);

    expect(result).toEqual({processed: 1, succeeded: 1, failed: 0, remaining: 0});
    expect(updateMaterialTitle).toHaveBeenCalledWith('21', 'Renamed file');
    expect(updateMaterial).not.toHaveBeenCalled();
    await expect(getMaterialsCache('7', '10')).resolves.toEqual([
      {...original, syncStatus: 'synced', updatedAt: expect.any(Number)},
    ]);
  },
);

test('an offline-created PDF is renamed using its remapped server ID', async () => {
  const localId = 'local-material-pdf';
  createPdfMaterial.mockResolvedValue(material('31', {
    title: 'Original file title', sourceType: 'pdf', content: undefined, fileName: 'study.pdf',
  }));
  await saveMaterialsCache('7', '10', [material(localId, {
    title: 'Renamed file', sourceType: 'pdf', content: undefined, fileName: 'study.pdf', syncStatus: 'pending',
  })]);
  await enqueueSyncOperation('7', {
    entity: 'material',
    action: 'create',
    payload: {
      localId, subjectId: '10', title: 'Original file title', sourceType: 'pdf',
      localFilePath: '/saved/local-study.pdf', fileName: 'study.pdf', mimeType: 'application/pdf',
    },
  });
  await enqueueSyncOperation('7', titleInput(localId));

  const result = await new OfflineSyncService().sync('7', session);

  expect(result).toEqual({processed: 2, succeeded: 2, failed: 0, remaining: 0});
  expect(createPdfMaterial).toHaveBeenCalledWith(expect.objectContaining({
    fileUri: 'file:///saved/local-study.pdf', title: 'Original file title',
  }));
  expect(updateMaterialTitle).toHaveBeenCalledWith('31', 'Renamed file');
  expect(updateMaterial).not.toHaveBeenCalled();
  const cached = await getMaterialsCache('7', '10');
  expect(cached).toHaveLength(1);
  expect(cached[0]).toMatchObject({id: '31', title: 'Renamed file', sourceType: 'pdf', fileName: 'study.pdf', syncStatus: 'synced'});
  await expect(getPendingSyncOperations('7')).resolves.toEqual([]);
});

test('a PDF upload preserves its queued title and file metadata when the subsequent rename fails', async () => {
  const localId = 'local-material-retry-pdf';
  const server = material('31', {
    title: 'Original file title', sourceType: 'pdf', content: 'Extracted PDF text', fileName: 'study.pdf',
  });
  createPdfMaterial.mockResolvedValue(server);
  updateMaterialTitle.mockRejectedValueOnce(httpError(500));
  await saveMaterialsCache('7', '10', [material(localId, {
    title: 'Newest offline title', sourceType: 'pdf', content: undefined, fileName: 'study.pdf', syncStatus: 'pending',
  })]);
  await enqueueSyncOperation('7', {
    entity: 'material', action: 'create',
    payload: {
      localId, subjectId: '10', title: 'Original file title', sourceType: 'pdf',
      localFilePath: '/saved/local-study.pdf', fileName: 'study.pdf', mimeType: 'application/pdf',
    },
  });
  const rename = await enqueueSyncOperation('7', titleInput(localId, 'Newest offline title'));

  const result = await new OfflineSyncService().sync('7', session);

  expect(result).toEqual({processed: 2, succeeded: 1, failed: 1, remaining: 1});
  expect(createPdfMaterial).toHaveBeenCalledTimes(1);
  await expect(getMaterialsCache('7', '10')).resolves.toEqual([
    {...server, title: 'Newest offline title', syncStatus: 'pending'},
  ]);
  await expect(getPendingSyncOperations('7')).resolves.toEqual([{
    ...rename,
    payload: {...rename.payload, materialId: '31'},
    attempts: 1,
    lastError: 'HTTP 500',
  }]);

  const retry = await new OfflineSyncService().sync('7', session);
  expect(retry).toEqual({processed: 1, succeeded: 1, failed: 0, remaining: 0});
  expect(createPdfMaterial).toHaveBeenCalledTimes(1);
  const cached = await getMaterialsCache('7', '10');
  expect(cached[0]).toMatchObject({id: '31', title: 'Newest offline title', sourceType: 'pdf', fileName: 'study.pdf', content: 'Extracted PDF text', syncStatus: 'synced'});
});

test('a successful text create preserves the latest offline edit if its update needs retrying', async () => {
  const localId = 'local-material-retry-text';
  createMaterial.mockResolvedValue(material('31', {title: 'Original title', content: 'Original content'}));
  updateMaterial.mockRejectedValueOnce(httpError(500));
  await saveMaterialsCache('7', '10', [material(localId, {
    title: 'Latest title', content: 'Latest content', syncStatus: 'pending',
  })]);
  await enqueueSyncOperation('7', {
    entity: 'material', action: 'create',
    payload: {localId, subjectId: '10', title: 'Original title', content: 'Original content'},
  });
  await enqueueSyncOperation('7', updateInput(localId, 'Latest title', 'Latest content'));

  const result = await new OfflineSyncService().sync('7', session);

  expect(result).toEqual({processed: 2, succeeded: 1, failed: 1, remaining: 1});
  const cached = await getMaterialsCache('7', '10');
  expect(cached).toHaveLength(1);
  expect(cached[0]).toMatchObject({id: '31', title: 'Latest title', content: 'Latest content', syncStatus: 'pending'});
  expect(createMaterial).toHaveBeenCalledTimes(1);
});

test('mixed text edits and title-only edits preserve the newest text while later renames are pending', async () => {
  const firstEntered = deferred();
  const firstRelease = deferred();
  const renameEntered = deferred();
  const renameRelease = deferred();
  updateMaterial
    .mockImplementationOnce(async () => {
      firstEntered.resolve();
      await firstRelease.promise;
    });
  updateMaterialTitle.mockImplementationOnce(async () => {
    renameEntered.resolve();
    await renameRelease.promise;
  });
  await saveMaterialsCache('7', '10', [material('21', {syncStatus: 'pending'})]);
  await enqueueSyncOperation('7', updateInput('21', 'First edit', 'First content'));
  const syncing = new OfflineSyncService().sync('7', session);
  await firstEntered.promise;
  await enqueueSyncOperation('7', updateInput('21', 'Newest text edit', 'Newest content'));
  const rename = await enqueueSyncOperation('7', titleInput('21', 'Final title'));
  await saveMaterialsCache('7', '10', [material('21', {
    title: 'Final title', content: 'Newest content', syncStatus: 'pending',
  })]);
  firstRelease.resolve();
  await renameEntered.promise;

  const pending = await getMaterialsCache('7', '10');
  expect(pending[0]).toMatchObject({title: 'Final title', content: 'Newest content', syncStatus: 'pending'});
  await expect(getPendingSyncOperations('7')).resolves.toEqual([rename]);

  renameRelease.resolve();
  expect(await syncing).toEqual({processed: 3, succeeded: 3, failed: 0, remaining: 0});
  const completed = await getMaterialsCache('7', '10');
  expect(completed[0]).toMatchObject({title: 'Final title', content: 'Newest content', syncStatus: 'synced'});
  expect(updateMaterial.mock.calls).toEqual([
    ['21', {title: 'First edit', content: 'First content'}],
    ['21', {title: 'Newest text edit', content: 'Newest content'}],
  ]);
});

test('replays an existing text edit and material deletion, preserving unrelated cached content', async () => {
  const unchanged = material('23');
  await saveMaterialsCache('7', '10', [
    material('21', {title: 'Edited note', content: 'Edited content', syncStatus: 'pending'}),
    unchanged,
  ]);
  await enqueueSyncOperation('7', updateInput('21'));
  await enqueueSyncOperation('7', deleteInput('22'));

  const result = await new OfflineSyncService().sync('7', session);

  expect(result).toEqual({processed: 2, succeeded: 2, failed: 0, remaining: 0});
  expect(updateMaterial).toHaveBeenCalledWith('21', {title: 'Edited note', content: 'Edited content'});
  expect(deleteMaterial).toHaveBeenCalledWith('22');
  expect(MaterialApiRepositoryImpl).toHaveBeenCalledWith(session.accessToken);
  await expect(getPendingSyncOperations('7')).resolves.toEqual([]);
  const cached = await getMaterialsCache('7', '10');
  expect(cached).toHaveLength(2);
  expect(cached[0]).toMatchObject({id: '21', title: 'Edited note', content: 'Edited content', syncStatus: 'synced'});
  expect(cached[1]).toEqual(unchanged);
});

test('an offline-created text note is edited using its new server ID during replay', async () => {
  const localId = 'local-material-demo';
  createMaterial.mockResolvedValue(material('31', {title: 'Original title', content: 'Original content'}));
  await saveMaterialsCache('7', '10', [
    material(localId, {title: 'Updated before reconnect', content: 'Latest content', syncStatus: 'pending'}),
  ]);
  await enqueueSyncOperation('7', {
    entity: 'material',
    action: 'create',
    payload: {localId, subjectId: '10', title: 'Original title', content: 'Original content'},
  });
  await enqueueSyncOperation('7', updateInput(localId, 'Updated before reconnect', 'Latest content'));

  const result = await new OfflineSyncService().sync('7', session);

  expect(result).toEqual({processed: 2, succeeded: 2, failed: 0, remaining: 0});
  expect(createMaterial).toHaveBeenCalledWith({
    userId: '7', subjectId: '10', sourceType: 'text', title: 'Original title', content: 'Original content',
  });
  expect(updateMaterial).toHaveBeenCalledWith('31', {title: 'Updated before reconnect', content: 'Latest content'});
  const cached = await getMaterialsCache('7', '10');
  expect(cached).toHaveLength(1);
  expect(cached[0]).toMatchObject({id: '31', title: 'Updated before reconnect', content: 'Latest content', syncStatus: 'synced'});
  await expect(getPendingSyncOperations('7')).resolves.toEqual([]);
});

test('an already-deleted server material clears its queued delete and allows the next edit to sync', async () => {
  deleteMaterial.mockRejectedValueOnce(httpError(404));
  await saveMaterialsCache('7', '10', [
    material('21', {sourceType: 'pdf', content: undefined}),
    material('22', {syncStatus: 'pending'}),
  ]);
  await enqueueSyncOperation('7', deleteInput('21'));
  await enqueueSyncOperation('7', updateInput('22'));

  const result = await new OfflineSyncService().sync('7', session);

  expect(result).toEqual({processed: 2, succeeded: 2, failed: 0, remaining: 0});
  expect(updateMaterial).toHaveBeenCalledWith('22', {title: 'Edited note', content: 'Edited content'});
  await expect(getPendingSyncOperations('7')).resolves.toEqual([]);
  const cached = await getMaterialsCache('7', '10');
  expect(cached).toHaveLength(1);
  expect(cached[0]).toMatchObject({id: '22', syncStatus: 'synced'});
});

test.each([
  ['unauthorized', httpError(401)],
  ['forbidden', httpError(403)],
  ['server error', httpError(500)],
  ['transport failure', new Error('Connection lost')],
])('a delete %s remains queued and prevents dependent replay until a later successful retry', async (_label, error) => {
  deleteMaterial.mockRejectedValueOnce(error);
  const unchanged = material('22', {syncStatus: 'pending'});
  await saveMaterialsCache('7', '10', [unchanged]);
  const deletion = await enqueueSyncOperation('7', deleteInput('21'));
  const edit = await enqueueSyncOperation('7', updateInput('22'));

  const result = await new OfflineSyncService().sync('7', session);

  expect(result).toEqual({processed: 1, succeeded: 0, failed: 1, remaining: 2});
  expect(updateMaterial).not.toHaveBeenCalled();
  await expect(getMaterialsCache('7', '10')).resolves.toEqual([unchanged]);
  await expect(getPendingSyncOperations('7')).resolves.toEqual([
    {...deletion, attempts: 1, lastError: error.message},
    edit,
  ]);

  const retry = await new OfflineSyncService().sync('7', session);
  expect(retry).toEqual({processed: 2, succeeded: 2, failed: 0, remaining: 0});
  await expect(getPendingSyncOperations('7')).resolves.toEqual([]);
});

test('completing an in-flight edit preserves a newer queued edit and its pending status', async () => {
  const firstEntered = deferred();
  const firstRelease = deferred();
  const secondEntered = deferred();
  const secondRelease = deferred();
  updateMaterial
    .mockImplementationOnce(async () => {
      firstEntered.resolve();
      await firstRelease.promise;
    })
    .mockImplementationOnce(async () => {
      secondEntered.resolve();
      await secondRelease.promise;
    });
  await saveMaterialsCache('7', '10', [material('21', {title: 'First edit', content: 'First content', syncStatus: 'pending'})]);
  await enqueueSyncOperation('7', updateInput('21', 'First edit', 'First content'));
  const syncing = new OfflineSyncService().sync('7', session);
  await firstEntered.promise;

  const newer = await enqueueSyncOperation('7', updateInput('21', 'Latest edit', 'Latest content'));
  await saveMaterialsCache('7', '10', [material('21', {title: 'Latest edit', content: 'Latest content', syncStatus: 'pending'})]);
  firstRelease.resolve();
  await secondEntered.promise;

  const whilePending = await getMaterialsCache('7', '10');
  expect(whilePending[0]).toMatchObject({title: 'Latest edit', content: 'Latest content', syncStatus: 'pending'});
  await expect(getPendingSyncOperations('7')).resolves.toEqual([newer]);

  secondRelease.resolve();
  expect(await syncing).toEqual({processed: 2, succeeded: 2, failed: 0, remaining: 0});
  const completed = await getMaterialsCache('7', '10');
  expect(completed[0]).toMatchObject({title: 'Latest edit', content: 'Latest content', syncStatus: 'synced'});
});

test('completing an earlier edit keeps a later queued deletion absent while its request is pending', async () => {
  const editEntered = deferred();
  const editRelease = deferred();
  const deleteEntered = deferred();
  const deleteRelease = deferred();
  updateMaterial.mockImplementationOnce(async () => {
    editEntered.resolve();
    await editRelease.promise;
  });
  deleteMaterial.mockImplementationOnce(async () => {
    deleteEntered.resolve();
    await deleteRelease.promise;
  });
  await saveMaterialsCache('7', '10', [material('21', {syncStatus: 'pending'})]);
  await enqueueSyncOperation('7', updateInput('21'));
  const syncing = new OfflineSyncService().sync('7', session);
  await editEntered.promise;

  const deletion = await enqueueSyncOperation('7', deleteInput('21'));
  editRelease.resolve();
  await deleteEntered.promise;

  await expect(getMaterialsCache('7', '10')).resolves.toEqual([]);
  await expect(getPendingSyncOperations('7')).resolves.toEqual([deletion]);

  deleteRelease.resolve();
  expect(await syncing).toEqual({processed: 2, succeeded: 2, failed: 0, remaining: 0});
  await expect(getMaterialsCache('7', '10')).resolves.toEqual([]);
});
