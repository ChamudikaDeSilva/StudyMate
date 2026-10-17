import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearPendingSyncQueue,
  enqueueSyncOperation,
  getPendingSyncOperations,
  markSyncOperationFailed,
  removeLocalEntityOperations,
  removeSyncOperation,
  replaceLocalEntityIdInQueue,
  subscribeToSyncQueue,
} from '../../src/data/local/sync/pendingSyncQueue';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const storage = new Map<string, string>();
const subscriptions: (() => void)[] = [];
const subscribe = (listener: (userId: string) => void) => {
  const unsubscribe = subscribeToSyncQueue(listener);
  subscriptions.push(unsubscribe);
  return unsubscribe;
};
const storageKey = (userId: string | number) =>
  `learnloop:offline:v1:user:${userId}:syncQueue`;
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>(complete => {
    resolve = complete;
  });
  return {promise, resolve};
};
const textUpdate = (materialId: string, subjectId = '10', title = 'Edited note') =>
  ({
    entity: 'material',
    action: 'update',
    payload: {materialId, subjectId, title, content: 'Saved offline content'},
  } as const);
const textCreate = (localId: string, subjectId = '10') =>
  ({
    entity: 'material',
    action: 'create',
    payload: {localId, subjectId, title: 'New note', content: 'New content'},
  } as const);

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
});

afterEach(() => {
  subscriptions.splice(0).forEach(unsubscribe => unsubscribe());
});

test('queue subscribers receive the normalized account only after an enqueue is persisted', async () => {
  const listener = jest.fn();
  subscribe(listener);
  const entered = deferred();
  const release = deferred();
  jest.mocked(AsyncStorage.setItem).mockImplementationOnce(async (key, value) => {
    entered.resolve();
    await release.promise;
    storage.set(key, value);
  });

  const adding = enqueueSyncOperation(7, textUpdate('21'));
  await entered.promise;
  expect(listener).not.toHaveBeenCalled();
  release.resolve();
  const added = await adding;

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith('7');
  await expect(getPendingSyncOperations('7')).resolves.toEqual([added]);
});

test('unsubscribing stops future queue notifications', async () => {
  const listener = jest.fn();
  const unsubscribe = subscribe(listener);
  await enqueueSyncOperation('7', textUpdate('21'));
  unsubscribe();
  unsubscribe();
  await enqueueSyncOperation('8', textUpdate('22'));

  expect(listener.mock.calls).toEqual([['7']]);
});

test('one throwing subscriber does not fail the enqueue or block other subscribers', async () => {
  subscribe(() => {
    throw new Error('Subscriber failed');
  });
  const listener = jest.fn();
  subscribe(listener);

  const added = await enqueueSyncOperation('7', textUpdate('21'));

  expect(listener).toHaveBeenCalledWith('7');
  await expect(getPendingSyncOperations('7')).resolves.toEqual([added]);
});

test('a failed enqueue does not notify subscribers', async () => {
  const listener = jest.fn();
  subscribe(listener);
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Disk full'));

  await expect(enqueueSyncOperation('7', textUpdate('21'))).rejects.toThrow('Disk full');
  expect(listener).not.toHaveBeenCalled();
  await expect(getPendingSyncOperations('7')).resolves.toEqual([]);
});

test('concurrent enqueues retain every change and normalize numeric account IDs', async () => {
  const changes = await Promise.all([
    enqueueSyncOperation(7, textUpdate('21')),
    enqueueSyncOperation('7', textUpdate('22')),
    enqueueSyncOperation(7, textUpdate('23')),
  ]);

  await expect(getPendingSyncOperations('7')).resolves.toEqual(changes);
  expect(changes.map(change => change.userId)).toEqual(['7', '7', '7']);
});

test('removing a replayed operation waits for an in-progress enqueue without losing the new change', async () => {
  const replayed = await enqueueSyncOperation('7', textUpdate('21'));
  const entered = deferred();
  const release = deferred();
  jest.mocked(AsyncStorage.setItem).mockImplementationOnce(async (key, value) => {
    entered.resolve();
    await release.promise;
    storage.set(key, value);
  });

  const adding = enqueueSyncOperation('7', textUpdate('22'));
  await entered.promise;
  const removing = removeSyncOperation('7', replayed.id);
  release.resolve();
  const [added] = await Promise.all([adding, removing]);

  await expect(getPendingSyncOperations('7')).resolves.toEqual([added]);
});

test('queued edits keep both remapped IDs while concurrent replay removes their create operation', async () => {
  const localId = 'local-material-1';
  const localSubjectId = 'local-subject-1';
  const created = await enqueueSyncOperation('7', textCreate(localId, localSubjectId));
  const unrelated = await enqueueSyncOperation('7', textUpdate('24', '11'));

  await Promise.all([
    enqueueSyncOperation('7', textUpdate(localId, localSubjectId)),
    replaceLocalEntityIdInQueue('7', localId, '31'),
    replaceLocalEntityIdInQueue('7', localSubjectId, '12'),
    removeSyncOperation('7', created.id),
  ]);

  const pending = await getPendingSyncOperations('7');
  expect(pending).toHaveLength(2);
  expect(pending[0]).toEqual(unrelated);
  expect(pending[1].payload).toEqual({
    materialId: '31',
    subjectId: '12',
    title: 'Edited note',
    content: 'Saved offline content',
  });
});

test('concurrent failure updates preserve attempt counts and newly queued changes', async () => {
  const failed = await enqueueSyncOperation('7', textUpdate('21'));
  const [, , added] = await Promise.all([
    markSyncOperationFailed('7', failed.id, new Error('Connection lost')),
    markSyncOperationFailed('7', failed.id, new Error('Still offline')),
    enqueueSyncOperation('7', textUpdate('22')),
  ]);

  await expect(getPendingSyncOperations('7')).resolves.toEqual([
    {...failed, attempts: 2, lastError: 'Still offline'},
    added,
  ]);
});

test('deleting an offline-created material cancels its create and edits without removing unrelated work', async () => {
  const unrelated = await enqueueSyncOperation('7', textUpdate('21'));
  const localId = 'local-material-1';

  await Promise.all([
    enqueueSyncOperation('7', textCreate(localId)),
    enqueueSyncOperation('7', textUpdate(localId)),
    removeLocalEntityOperations('7', localId),
  ]);

  await expect(getPendingSyncOperations('7')).resolves.toEqual([unrelated]);
});

test('deleting a local subject also cancels its pending material changes', async () => {
  const unrelated = await enqueueSyncOperation('7', textUpdate('21', '10'));
  const localSubjectId = 'local-subject-1';

  await Promise.all([
    enqueueSyncOperation('7', {
      entity: 'subject',
      action: 'create',
      payload: {localId: localSubjectId, name: 'Temporary subject'},
    }),
    enqueueSyncOperation('7', textCreate('local-material-1', localSubjectId)),
    enqueueSyncOperation('7', textUpdate('local-material-1', localSubjectId)),
    removeLocalEntityOperations('7', localSubjectId),
  ]);

  await expect(getPendingSyncOperations('7')).resolves.toEqual([unrelated]);
});

test('a blocked write for one account does not delay or change another account queue', async () => {
  const entered = deferred();
  const release = deferred();
  jest.mocked(AsyncStorage.setItem).mockImplementationOnce(async (key, value) => {
    entered.resolve();
    await release.promise;
    storage.set(key, value);
  });

  const first = enqueueSyncOperation('7', textUpdate('21'));
  await entered.promise;
  const second = await enqueueSyncOperation('8', textUpdate('22'));
  await expect(getPendingSyncOperations('8')).resolves.toEqual([second]);
  expect(storage.has(storageKey('7'))).toBe(false);

  release.resolve();
  const firstChange = await first;
  await expect(getPendingSyncOperations('7')).resolves.toEqual([firstChange]);
  await clearPendingSyncQueue('7');
  await expect(getPendingSyncOperations('8')).resolves.toEqual([second]);
});

test('a failed write rejects its caller and the next queued mutation still succeeds', async () => {
  const existing = await enqueueSyncOperation('7', textUpdate('21'));
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Disk full'));

  const failed = enqueueSyncOperation('7', textUpdate('22'));
  const succeeding = enqueueSyncOperation('7', textUpdate('23'));
  const results = await Promise.allSettled([failed, succeeding]);

  expect(results[0]).toEqual({status: 'rejected', reason: new Error('Disk full')});
  expect(results[1].status).toBe('fulfilled');
  await expect(getPendingSyncOperations('7')).resolves.toEqual([
    existing,
    await succeeding,
  ]);
});

test('a failed read cannot overwrite the saved queue and does not block a later mutation', async () => {
  const existing = await enqueueSyncOperation('7', textUpdate('21'));
  jest.mocked(AsyncStorage.setItem).mockClear();
  jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error('Storage unavailable'));

  await expect(enqueueSyncOperation('7', textUpdate('22'))).rejects.toThrow(
    'Storage unavailable',
  );
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  const added = await enqueueSyncOperation('7', textUpdate('23'));
  await expect(getPendingSyncOperations('7')).resolves.toEqual([existing, added]);
});

test('clear waits for previous writes and preserves a change requested afterwards', async () => {
  const entered = deferred();
  const release = deferred();
  jest.mocked(AsyncStorage.setItem).mockImplementationOnce(async (key, value) => {
    entered.resolve();
    await release.promise;
    storage.set(key, value);
  });

  const previous = enqueueSyncOperation('7', textUpdate('21'));
  await entered.promise;
  const clearing = clearPendingSyncQueue('7');
  const adding = enqueueSyncOperation('7', textUpdate('22'));
  expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  release.resolve();
  const [, , added] = await Promise.all([previous, clearing, adding]);

  await expect(getPendingSyncOperations('7')).resolves.toEqual([added]);
});

test('failed clearing is reported and later queue changes still work', async () => {
  const existing = await enqueueSyncOperation('7', textUpdate('21'));
  jest.mocked(AsyncStorage.removeItem).mockRejectedValueOnce(new Error('Storage locked'));

  await expect(clearPendingSyncQueue('7')).rejects.toThrow('Storage locked');
  const added = await enqueueSyncOperation('7', textUpdate('22'));
  await expect(getPendingSyncOperations('7')).resolves.toEqual([existing, added]);
});

test.each(['{', '{"unexpected":"object"}'])(
  'reading a damaged queue leaves it unchanged and mutation fails without discarding it: %s',
  async raw => {
    storage.set(storageKey('7'), raw);
    await expect(getPendingSyncOperations('7')).resolves.toEqual([]);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();

    await expect(enqueueSyncOperation('7', textUpdate('21'))).rejects.toThrow();
    expect(storage.get(storageKey('7'))).toBe(raw);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  },
);
