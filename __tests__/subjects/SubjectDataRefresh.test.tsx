import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getSubjectsCache,
  saveSubjectsCache,
  updateSubjectsCache,
} from '../../src/data/local/storage/offlineCache';
import {getPendingSyncOperations} from '../../src/data/local/sync/pendingSyncQueue';
import {SubjectApiRepositoryImpl} from '../../src/data/repositories/SubjectApiRepositoryImpl';
import {Subject} from '../../src/domain/models/Subject';
import {useAuth} from '../../src/hooks/useAuth';
import {useNetwork} from '../../src/hooks/useNetwork';
import {useSubjects} from '../../src/hooks/useSubjects';

jest.mock('@react-native-async-storage/async-storage', () => {
  const storage = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: async (key: string) => storage.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: async (key: string) => {
        storage.delete(key);
      },
      clear: async () => storage.clear(),
    },
  };
});
jest.mock('../../src/data/repositories/SubjectApiRepositoryImpl', () => ({
  SubjectApiRepositoryImpl: jest.fn(),
}));
jest.mock('../../src/hooks/useAuth', () => ({useAuth: jest.fn()}));
jest.mock('../../src/hooks/useNetwork', () => ({useNetwork: jest.fn()}));
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));

const subject = (id: string, overrides: Partial<Subject> = {}): Subject => ({
  id,
  userId: '1',
  name: `Subject ${id}`,
  description: `Description ${id}`,
  createdAt: 1,
  updatedAt: 1,
  syncStatus: 'synced',
  ...overrides,
});
const repository = {
  getSubjects: jest.fn<Promise<Subject[]>, [string]>(),
  createSubject: jest.fn(),
  updateSubject: jest.fn(),
  deleteSubject: jest.fn(),
};
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];
const states = new Map<string, ReturnType<typeof useSubjects>>();
let accountId = 1;
let isOnline = false;
let networkInitialized = true;

const ObserveSubjects = ({slot = 'main'}: {slot?: string}) => {
  states.set(slot, useSubjects());
  return null;
};
const current = (slot = 'main') => states.get(slot)!;
const renderHook = async (slot = 'main') => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(<ObserveSubjects slot={slot} />);
  });
  mounted.push(renderer);
  return renderer;
};
const rerender = async (renderer: ReactTestRenderer.ReactTestRenderer, slot = 'main') => {
  await act(async () => {
    renderer.update(<ObserveSubjects slot={slot} />);
  });
};
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((complete, fail) => {
    resolve = complete;
    reject = fail;
  });
  return {promise, resolve, reject};
};

beforeEach(async () => {
  jest.resetAllMocks();
  await AsyncStorage.clear();
  states.clear();
  accountId = 1;
  isOnline = false;
  networkInitialized = true;
  jest.mocked(useAuth).mockImplementation(() => ({
    user: {id: accountId, name: 'Student', email: 'student@example.com'},
  } as ReturnType<typeof useAuth>));
  jest.mocked(useNetwork).mockImplementation(() => ({
    initialized: networkInitialized,
    isOnline,
    isConnected: isOnline,
    isInternetReachable: isOnline,
    connectionType: isOnline ? 'wifi' : 'none',
  }));
  jest.mocked(SubjectApiRepositoryImpl).mockImplementation(
    () => repository as unknown as SubjectApiRepositoryImpl,
  );
  repository.getSubjects.mockResolvedValue([]);
});

afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
  jest.restoreAllMocks();
});

test('a focus-like refresh keeps cached rows visible while its network request is pending', async () => {
  const original = subject('10');
  const response = deferred<Subject[]>();
  await saveSubjectsCache('1', [original]);
  isOnline = true;
  repository.getSubjects.mockReturnValueOnce(response.promise);

  await renderHook();

  expect(current().subjects).toEqual([original]);
  expect(current().loading).toBe(false);
  expect(repository.getSubjects).toHaveBeenCalledWith('1');
  await act(async () => response.resolve([original]));
});

test('an older overlapping GET cannot overwrite a newer refresh in state or storage', async () => {
  const older = deferred<Subject[]>();
  const newer = deferred<Subject[]>();
  const latest = subject('10', {name: 'Latest server subject', updatedAt: 5});
  await saveSubjectsCache('1', [subject('10')]);
  isOnline = true;
  repository.getSubjects.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
  await renderHook();

  let refreshing!: Promise<void>;
  await act(async () => {
    refreshing = current().loadSubjects();
  });
  expect(repository.getSubjects).toHaveBeenCalledTimes(2);
  await act(async () => {
    newer.resolve([latest]);
    await refreshing;
  });
  await act(async () => older.resolve([subject('10', {name: 'Stale server subject'})]));

  expect(current().subjects).toEqual([latest]);
  expect(await getSubjectsCache('1')).toEqual([latest]);
});

test('a GET from the previous account cannot replace the newly selected account or either cache', async () => {
  const oldAccount = deferred<Subject[]>();
  const original = subject('10');
  const secondAccount = subject('20', {userId: '2', name: 'Account two subject'});
  await saveSubjectsCache('1', [original]);
  await saveSubjectsCache('2', [secondAccount]);
  isOnline = true;
  repository.getSubjects.mockReturnValueOnce(oldAccount.promise).mockResolvedValueOnce([secondAccount]);
  const renderer = await renderHook();

  accountId = 2;
  await rerender(renderer);
  expect(repository.getSubjects).toHaveBeenLastCalledWith('2');
  expect(current().subjects).toEqual([secondAccount]);
  await act(async () => oldAccount.resolve([subject('10', {name: 'Late account one response'})]));

  expect(current().subjects).toEqual([secondAccount]);
  expect(await getSubjectsCache('1')).toEqual([original]);
  expect(await getSubjectsCache('2')).toEqual([secondAccount]);
});

test('repeated focus-like loads preserve pending subject creates, edits and deletions', async () => {
  const originals = [subject('10'), subject('11'), subject('12')];
  await saveSubjectsCache('1', originals);
  const renderer = await renderHook();
  let created!: Subject;
  await act(async () => {
    created = await current().createSubject('Offline addition', 'New subject description');
    await current().updateSubject('10', 'Offline edit', 'Edited description');
    await current().deleteSubject('11');
  });
  repository.getSubjects.mockResolvedValue([...originals, subject('13', {name: 'New server subject'})]);
  isOnline = true;
  await rerender(renderer);
  await act(async () => {
    await current().loadSubjects();
    await current().loadSubjects();
  });

  expect(current().subjects).toHaveLength(4);
  expect(current().subjects).toEqual(expect.arrayContaining([
    expect.objectContaining({id: created.id, name: 'Offline addition', syncStatus: 'pending'}),
    expect.objectContaining({id: '10', name: 'Offline edit', description: 'Edited description', syncStatus: 'pending'}),
    subject('12'),
    subject('13', {name: 'New server subject'}),
  ]));
  expect(current().subjects.some(item => item.id === '11')).toBe(false);
  expect(await getSubjectsCache('1')).toEqual(current().subjects);
  expect(await getPendingSyncOperations('1')).toHaveLength(3);
  expect(repository.createSubject).not.toHaveBeenCalled();
  expect(repository.updateSubject).not.toHaveBeenCalled();
  expect(repository.deleteSubject).not.toHaveBeenCalled();
});

test('a failed GET reads the latest shared cache rather than restoring its initial snapshot', async () => {
  const response = deferred<Subject[]>();
  const latest = subject('10', {name: 'Edited by another screen', updatedAt: 5, syncStatus: 'pending'});
  await saveSubjectsCache('1', [subject('10')]);
  isOnline = true;
  repository.getSubjects.mockReturnValueOnce(response.promise);
  await renderHook();

  await updateSubjectsCache('1', () => [latest]);
  await act(async () => response.reject(new Error('Network request failed')));

  expect(current().subjects).toEqual([latest]);
  expect(current().error).toBeNull();
  expect(current().loading).toBe(false);
  expect(await getSubjectsCache('1')).toEqual([latest]);
});

test('two mounted screen hooks see persisted edits after the second screen refreshes', async () => {
  await saveSubjectsCache('1', [subject('10')]);
  await renderHook('home');
  await renderHook('subjects');

  await act(async () => {
    await current('subjects').updateSubject('10', 'Edited in Subjects', 'Shared details');
  });
  expect(current('home').subjects[0].name).toBe('Subject 10');
  await act(async () => current('home').loadSubjects());

  expect(current('home').subjects).toEqual(current('subjects').subjects);
  expect(current('home').subjects[0]).toMatchObject({
    name: 'Edited in Subjects', description: 'Shared details', syncStatus: 'pending',
  });
  expect(repository.getSubjects).not.toHaveBeenCalled();
});

test.each([
  {initialized: false, online: true},
  {initialized: false, online: false},
  {initialized: true, online: false},
])('network state $initialized/$online preserves cache without a server request', async ({initialized, online}) => {
  const original = subject('10');
  await saveSubjectsCache('1', [original]);
  networkInitialized = initialized;
  isOnline = online;

  await renderHook();
  await act(async () => current().loadSubjects());

  expect(current().subjects).toEqual([original]);
  expect(current().loading).toBe(false);
  expect(current().error).toBeNull();
  expect(repository.getSubjects).not.toHaveBeenCalled();
  expect(await getSubjectsCache('1')).toEqual([original]);
});

test.each(['edit', 'create', 'delete'] as const)(
  'an offline subject %s waits for its cache write before completing',
  async action => {
    const original = subject('10');
    await saveSubjectsCache('1', [original]);
    await renderHook();
    const writing = deferred<void>();
    const originalSetItem = AsyncStorage.setItem;
    let writeStarted = false;
    let completed = false;
    jest.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => {
      if (key.endsWith(':subjects')) {
        writeStarted = true;
        await writing.promise;
      }
      await originalSetItem(key, value);
    });
    let mutation!: Promise<unknown>;
    await act(async () => {
      mutation = (action === 'edit'
        ? current().updateSubject('10', 'Persisted edit')
        : action === 'create'
          ? current().createSubject('Persisted addition')
          : current().deleteSubject('10')
      ).then(() => {
        completed = true;
      });
    });

    try {
      expect(writeStarted).toBe(true);
      expect(completed).toBe(false);
      expect(await getSubjectsCache('1')).toEqual([original]);
    } finally {
      await act(async () => {
        writing.resolve();
        await mutation;
      });
    }

    expect(completed).toBe(true);
    const persisted = await getSubjectsCache('1');
    expect(persisted).toEqual(current().subjects);
    if (action === 'edit') {
      expect(persisted).toEqual([expect.objectContaining({name: 'Persisted edit', syncStatus: 'pending'})]);
    } else if (action === 'create') {
      expect(persisted).toEqual([
        expect.objectContaining({name: 'Persisted addition', syncStatus: 'pending'}),
        original,
      ]);
    } else {
      expect(persisted).toEqual([]);
    }
    expect(await getPendingSyncOperations('1')).toHaveLength(1);
  },
);
