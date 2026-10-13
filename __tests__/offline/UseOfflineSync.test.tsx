import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { getPendingSyncCount } from '../../src/data/local/sync/pendingSyncQueue';
import { SyncSession } from '../../src/domain/models/SyncSession';
import { useAuth } from '../../src/hooks/useAuth';
import { useNetwork } from '../../src/hooks/useNetwork';
import { useOfflineSync } from '../../src/hooks/useOfflineSync';
import { offlineSyncService } from '../../src/services/offline/OfflineSyncService';

jest.mock('../../src/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../src/hooks/useNetwork', () => ({ useNetwork: jest.fn() }));
jest.mock('../../src/data/local/sync/pendingSyncQueue', () => ({
  getPendingSyncCount: jest.fn(),
}));
jest.mock('../../src/services/offline/OfflineSyncService', () => ({
  offlineSyncService: { sync: jest.fn() },
}));
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));

const user = {
  id: 1,
  name: 'Alex Student',
  email: 'alex@example.com',
  created_at: '',
  updated_at: '',
};
const successfulResult = {
  processed: 1,
  succeeded: 1,
  failed: 0,
  remaining: 0,
};
let authState: ReturnType<typeof useAuth>;
let syncState!: ReturnType<typeof useOfflineSync>;
let currentSession: SyncSession | null;
const getSyncSession = jest.fn(() => currentSession);
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

const ObserveSync = () => {
  syncState = useOfflineSync();
  return null;
};
const renderHook = async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(<ObserveSync />);
  });
  mounted.push(renderer);
  return renderer;
};
const rerender = async (renderer: ReactTestRenderer.ReactTestRenderer) => {
  await act(async () => {
    renderer.update(<ObserveSync />);
  });
};
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(complete => {
    resolve = complete;
  });
  return { promise, resolve };
};
const makeSession = (userId: string, accessToken: string): SyncSession => {
  const session: SyncSession = {
    userId,
    accessToken,
    isCurrent: () => currentSession === session,
  };
  return session;
};

beforeEach(() => {
  jest.clearAllMocks();
  currentSession = makeSession('1', 'token-a');
  authState = {
    user,
    loading: false,
    sessionValidated: true,
    getSyncSession,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };
  jest.mocked(useAuth).mockImplementation(() => authState);
  jest.mocked(useNetwork).mockReturnValue({
    initialized: true,
    isOnline: true,
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'wifi',
  });
  jest.mocked(getPendingSyncCount).mockResolvedValue(1);
  jest.mocked(offlineSyncService.sync).mockResolvedValue(successfulResult);
});
afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
});

test('a cached account never reads or uploads its queue until its session is validated', async () => {
  authState = { ...authState, sessionValidated: false };
  const renderer = await renderHook();
  await act(async () => {
    await syncState.syncNow();
  });

  expect(getPendingSyncCount).not.toHaveBeenCalled();
  expect(offlineSyncService.sync).not.toHaveBeenCalled();

  authState = { ...authState, sessionValidated: true };
  await rerender(renderer);

  expect(getPendingSyncCount).toHaveBeenCalledWith('1');
  expect(offlineSyncService.sync).toHaveBeenCalledWith('1', currentSession);
  expect(syncState.lastResult).toEqual(successfulResult);
  expect(syncState.syncing).toBe(false);
});

test('invalidating a session while its pending count is being read prevents upload', async () => {
  const counting = deferred<number>();
  jest.mocked(getPendingSyncCount).mockReturnValueOnce(counting.promise);
  await renderHook();
  expect(syncState.syncing).toBe(true);

  currentSession = null;
  await act(async () => {
    counting.resolve(1);
    await counting.promise;
  });

  expect(offlineSyncService.sync).not.toHaveBeenCalled();
  expect(syncState.lastResult).toBeNull();
  expect(syncState.syncing).toBe(false);
});

test('switching accounts during a queue count never starts the old account using the new session', async () => {
  const counting = deferred<number>();
  jest.mocked(getPendingSyncCount).mockReturnValueOnce(counting.promise);
  const renderer = await renderHook();

  currentSession = makeSession('2', 'token-b');
  authState = {
    ...authState,
    user: { ...user, id: 2, name: 'Another Student' },
    sessionValidated: false,
  };
  await rerender(renderer);
  await act(async () => {
    counting.resolve(1);
    await counting.promise;
  });

  expect(offlineSyncService.sync).not.toHaveBeenCalled();
  expect(syncState.lastResult).toBeNull();

  authState = { ...authState, sessionValidated: true };
  await rerender(renderer);

  expect(offlineSyncService.sync).toHaveBeenCalledTimes(1);
  expect(offlineSyncService.sync).toHaveBeenCalledWith('2', currentSession);
});

test('a newly validated account automatically syncs after an old account queue count releases the lock', async () => {
  const counting = deferred<number>();
  jest.mocked(getPendingSyncCount).mockReturnValueOnce(counting.promise);
  const renderer = await renderHook();

  currentSession = makeSession('2', 'token-b');
  authState = {
    ...authState,
    user: { ...user, id: 2, name: 'Another Student' },
  };
  await rerender(renderer);
  expect(offlineSyncService.sync).not.toHaveBeenCalled();

  await act(async () => {
    counting.resolve(1);
    await counting.promise;
  });

  expect(getPendingSyncCount).toHaveBeenNthCalledWith(1, '1');
  expect(getPendingSyncCount).toHaveBeenNthCalledWith(2, '2');
  expect(offlineSyncService.sync).toHaveBeenCalledTimes(1);
  expect(offlineSyncService.sync).toHaveBeenCalledWith('2', currentSession);
  expect(syncState.lastResult).toEqual(successfulResult);
  expect(syncState.syncing).toBe(false);
});

test('a new account sync begins after the old in-flight run finishes without showing the old result', async () => {
  const oldResult = { processed: 2, succeeded: 1, failed: 1, remaining: 3 };
  const completing = deferred<typeof oldResult>();
  jest.mocked(offlineSyncService.sync).mockReturnValueOnce(completing.promise);
  const renderer = await renderHook();
  expect(offlineSyncService.sync).toHaveBeenCalledTimes(1);

  currentSession = makeSession('2', 'token-b');
  authState = {
    ...authState,
    user: { ...user, id: 2, name: 'Another Student' },
  };
  await rerender(renderer);
  expect(offlineSyncService.sync).toHaveBeenCalledTimes(1);
  expect(syncState.lastResult).toBeNull();

  await act(async () => {
    completing.resolve(oldResult);
    await completing.promise;
  });

  expect(offlineSyncService.sync).toHaveBeenCalledTimes(2);
  expect(offlineSyncService.sync).toHaveBeenLastCalledWith('2', currentSession);
  expect(syncState.lastResult).toEqual(successfulResult);
});

test('an old account sync result arriving after account switch is not shown for the new account', async () => {
  const completing = deferred<typeof successfulResult>();
  jest.mocked(offlineSyncService.sync).mockReturnValueOnce(completing.promise);
  const renderer = await renderHook();
  expect(offlineSyncService.sync).toHaveBeenCalledTimes(1);

  currentSession = null;
  authState = { ...authState, user: null, sessionValidated: false };
  await rerender(renderer);
  await act(async () => {
    completing.resolve(successfulResult);
    await completing.promise;
  });

  expect(syncState.lastResult).toBeNull();
  expect(syncState.syncing).toBe(false);
});

test('a validated account does not sync while network state is unavailable or offline', async () => {
  jest.mocked(useNetwork).mockReturnValue({
    initialized: false,
    isOnline: false,
    isConnected: false,
    isInternetReachable: false,
    connectionType: 'unknown',
  });
  const renderer = await renderHook();
  await act(async () => {
    await syncState.syncNow();
  });
  expect(getPendingSyncCount).not.toHaveBeenCalled();

  jest.mocked(useNetwork).mockReturnValue({
    initialized: true,
    isOnline: false,
    isConnected: false,
    isInternetReachable: false,
    connectionType: 'none',
  });
  await rerender(renderer);

  expect(getPendingSyncCount).not.toHaveBeenCalled();
  expect(offlineSyncService.sync).not.toHaveBeenCalled();
});
