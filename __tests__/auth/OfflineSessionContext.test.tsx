import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { AppState, AppStateStatus } from 'react-native';
import { AuthProvider } from '../../src/context/AuthContext';
import { useAuth } from '../../src/hooks/useAuth';
import { useNetwork } from '../../src/hooks/useNetwork';
import * as service from '../../src/data/remote/api/authService';
import * as storage from '../../src/data/local/tokenStorage';
import { ApiError } from '../../src/data/remote/api/apiClient';
import { AuthUser } from '../../src/domain/models/AuthUser';
import { LoginResponse } from '../../src/data/remote/api/authTypes';

jest.mock('../../src/data/remote/api/authService', () => ({
  getCurrentUser: jest.fn(),
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  logoutUser: jest.fn(),
  updateCurrentUser: jest.fn(),
  changeCurrentPassword: jest.fn(),
}));
jest.mock('../../src/data/local/tokenStorage', () => ({
  getStoredSession: jest.fn(),
  saveSession: jest.fn(),
  cacheSessionUser: jest.fn(),
  clearAccessToken: jest.fn(),
}));
jest.mock('../../src/hooks/useNetwork', () => ({ useNetwork: jest.fn() }));
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));

const cachedUser: AuthUser = {
  id: 1,
  name: 'Alex Student',
  email: 'alex@example.com',
  created_at: '2026-10-12T10:00:00',
  updated_at: '2026-10-12T10:00:00',
};
const updatedUser = { ...cachedUser, name: 'Alex Taylor' };
const otherUser = { ...cachedUser, id: 2, name: 'Another Student' };
const cachedSession = { accessToken: 'cached-session', user: cachedUser };
const signInResponse: LoginResponse = {
  access_token: 'signed-in-session',
  token_type: 'bearer',
  user: otherUser,
};
let auth!: ReturnType<typeof useAuth>;
let networkState: ReturnType<typeof useNetwork>;
let onAppState!: (state: AppStateStatus) => void;
const removeAppState = jest.fn();
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(complete => {
    resolve = complete;
  });
  return { promise, resolve };
};
const ObserveAuth = () => {
  auth = useAuth();
  return null;
};
const providerTree = () => (
  <AuthProvider>
    <ObserveAuth />
  </AuthProvider>
);
const mountProvider = async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(providerTree());
    mounted.push(renderer);
  });
  return renderer;
};
const setOnline = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  isOnline: boolean,
  initialized = true,
) => {
  networkState = {
    ...networkState,
    isOnline,
    isConnected: isOnline,
    isInternetReachable: isOnline,
    initialized,
  };
  await act(async () => renderer.update(providerTree()));
};

beforeEach(() => {
  jest.resetAllMocks();
  networkState = {
    isOnline: false,
    isConnected: false,
    isInternetReachable: false,
    initialized: true,
    connectionType: 'none',
  };
  jest.mocked(useNetwork).mockImplementation(() => networkState);
  jest.mocked(storage.getStoredSession).mockResolvedValue(cachedSession);
  jest.mocked(storage.saveSession).mockResolvedValue(undefined);
  jest.mocked(storage.cacheSessionUser).mockResolvedValue(true);
  jest.mocked(storage.clearAccessToken).mockResolvedValue(undefined);
  jest.mocked(service.getCurrentUser).mockResolvedValue(cachedUser);
  jest.mocked(service.loginUser).mockResolvedValue(signInResponse);
  jest.mocked(service.logoutUser).mockResolvedValue(undefined);
  jest.mocked(service.registerUser).mockResolvedValue(otherUser);
  jest.mocked(service.updateCurrentUser).mockResolvedValue({
    access_token: 'updated-session',
    token_type: 'bearer',
    user: updatedUser,
  });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    onAppState = listener;
    return { remove: removeAppState };
  });
});
afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
  jest.restoreAllMocks();
});

test('an offline cold start restores the cached account without contacting or clearing the session', async () => {
  await mountProvider();
  expect(auth.user).toEqual(cachedUser);
  expect(auth.loading).toBe(false);
  expect(auth.sessionValidated).toBe(false);
  expect(auth.getSyncSession()).toBeNull();
  expect(service.getCurrentUser).not.toHaveBeenCalled();
  expect(storage.clearAccessToken).not.toHaveBeenCalled();
});

test.each([
  ['network failure', new TypeError('Network request failed')],
  ['unavailable backend', new ApiError('Service temporarily unavailable', 503)],
])('a %s keeps the secured local account and disables synchronization', async (_label, error) => {
  networkState = { ...networkState, isOnline: true, isConnected: true };
  jest.mocked(service.getCurrentUser).mockRejectedValue(error);
  await mountProvider();
  expect(service.getCurrentUser).toHaveBeenCalledWith(cachedSession.accessToken);
  expect(auth.user).toEqual(cachedUser);
  expect(auth.sessionValidated).toBe(false);
  expect(auth.getSyncSession()).toBeNull();
  expect(storage.clearAccessToken).not.toHaveBeenCalled();
  expect(storage.cacheSessionUser).not.toHaveBeenCalled();
});

test.each([401, 403])('a confirmed HTTP %s rejection clears the secured local account', async status => {
  networkState = { ...networkState, isOnline: true, isConnected: true };
  jest.mocked(service.getCurrentUser).mockRejectedValue(new ApiError('Sign in again', status));
  await mountProvider();
  expect(auth.user).toBeNull();
  expect(auth.accountNotice).toContain('session expired');
  expect(auth.getSyncSession()).toBeNull();
  expect(storage.clearAccessToken).toHaveBeenCalledTimes(1);
});

test('a legacy token has no offline identity but can migrate after online validation', async () => {
  jest.mocked(storage.getStoredSession).mockResolvedValue({
    accessToken: 'legacy-session',
    user: null,
  });
  const renderer = await mountProvider();
  expect(auth.user).toBeNull();
  expect(service.getCurrentUser).not.toHaveBeenCalled();
  expect(storage.clearAccessToken).not.toHaveBeenCalled();
  await setOnline(renderer, true);
  expect(service.getCurrentUser).toHaveBeenCalledWith('legacy-session');
  expect(storage.cacheSessionUser).toHaveBeenCalledWith('legacy-session', cachedUser);
  expect(auth.user).toEqual(cachedUser);
  expect(auth.sessionValidated).toBe(true);
});

test('a backend identity differing from the cached account is rejected before caching or syncing', async () => {
  networkState = { ...networkState, isOnline: true, isConnected: true };
  jest.mocked(service.getCurrentUser).mockResolvedValue(otherUser);
  await mountProvider();
  expect(auth.user).toBeNull();
  expect(auth.accountNotice).toContain('could not be verified');
  expect(storage.clearAccessToken).toHaveBeenCalledTimes(1);
  expect(storage.cacheSessionUser).not.toHaveBeenCalled();
  expect(auth.getSyncSession()).toBeNull();
});

test('reconnection does not permit replay until the original bearer token is validated and cached', async () => {
  const pending = deferred<AuthUser>();
  const pendingCache = deferred<boolean>();
  jest.mocked(service.getCurrentUser).mockReturnValueOnce(pending.promise);
  jest.mocked(storage.cacheSessionUser).mockReturnValueOnce(pendingCache.promise);
  const renderer = await mountProvider();
  await setOnline(renderer, true);
  expect(auth.user).toEqual(cachedUser);
  expect(auth.sessionValidated).toBe(false);
  expect(auth.getSyncSession()).toBeNull();
  await act(async () => pending.resolve(updatedUser));
  expect(storage.cacheSessionUser).toHaveBeenCalledWith('cached-session', updatedUser);
  expect(auth.getSyncSession()).toBeNull();
  await act(async () => pendingCache.resolve(true));
  const syncSession = auth.getSyncSession();
  expect(syncSession).toMatchObject({ userId: '1', accessToken: 'cached-session' });
  expect(syncSession?.isCurrent()).toBe(true);
  expect(auth.user).toEqual(updatedUser);
  expect(auth.sessionValidated).toBe(true);
  await setOnline(renderer, false);
  expect(syncSession?.isCurrent()).toBe(false);
  expect(auth.getSyncSession()).toBeNull();
});

test('a validation response arriving after logout cannot cache or restore the account', async () => {
  networkState = { ...networkState, isOnline: true, isConnected: true };
  const pending = deferred<AuthUser>();
  jest.mocked(service.getCurrentUser).mockReturnValueOnce(pending.promise);
  await mountProvider();
  await act(async () => auth.logout());
  await act(async () => pending.resolve(cachedUser));
  expect(auth.user).toBeNull();
  expect(storage.cacheSessionUser).not.toHaveBeenCalled();
  expect(auth.getSyncSession()).toBeNull();
});

test('a rejected validation response from an old account cannot clear a newer sign-in', async () => {
  networkState = { ...networkState, isOnline: true, isConnected: true };
  let rejectValidation!: (reason: Error) => void;
  const pending = new Promise<AuthUser>((_resolve, reject) => { rejectValidation = reject; });
  jest.mocked(service.getCurrentUser).mockReturnValueOnce(pending);
  await mountProvider();
  await act(async () => auth.login(otherUser.email, 'example-password'));
  const clearsAfterSignIn = jest.mocked(storage.clearAccessToken).mock.calls.length;
  await act(async () => rejectValidation(new ApiError('Old session rejected', 401)));
  expect(auth.user).toEqual(otherUser);
  expect(storage.clearAccessToken).toHaveBeenCalledTimes(clearsAfterSignIn);
  expect(storage.cacheSessionUser).not.toHaveBeenCalled();
  expect(auth.getSyncSession()).toMatchObject({
    userId: '2',
    accessToken: signInResponse.access_token,
  });
});

test('a late previous-session check cannot overwrite a newer profile update', async () => {
  networkState = { ...networkState, isOnline: true, isConnected: true };
  const pending = deferred<AuthUser>();
  jest.mocked(service.getCurrentUser).mockReturnValueOnce(pending.promise);
  jest.mocked(service.loginUser).mockResolvedValueOnce({ ...signInResponse, user: cachedUser });
  await mountProvider();
  await act(async () => auth.login(cachedUser.email, 'example-password'));
  await act(async () => auth.updateProfile({ name: updatedUser.name, email: updatedUser.email }));
  await act(async () => pending.resolve(cachedUser));
  expect(auth.user).toEqual(updatedUser);
  expect(auth.getSyncSession()).toMatchObject({ userId: '1', accessToken: 'updated-session' });
  expect(storage.cacheSessionUser).not.toHaveBeenCalled();
  expect(storage.saveSession).toHaveBeenLastCalledWith('updated-session', updatedUser);
});

test('a late secure-storage hydration cannot replace a sign-in completed while it was waiting', async () => {
  const pending = deferred<storage.StoredAuthSession | null>();
  jest.mocked(storage.getStoredSession).mockReturnValueOnce(pending.promise);
  await mountProvider();
  expect(auth.loading).toBe(true);
  await act(async () => auth.login(otherUser.email, 'example-password'));
  await act(async () => pending.resolve(cachedSession));
  expect(auth.user).toEqual(otherUser);
  expect(auth.loading).toBe(false);
  expect(storage.saveSession).toHaveBeenCalledWith(signInResponse.access_token, otherUser);
});

test('an account switch abandons the old mutation lock without allowing its response to unlock a new mutation', async () => {
  networkState = { ...networkState, isOnline: true, isConnected: true };
  const oldUpdate = deferred<LoginResponse>();
  const newUpdate = deferred<LoginResponse>();
  const changedOtherUser = { ...otherUser, name: 'Another Name' };
  jest.mocked(service.updateCurrentUser)
    .mockReturnValueOnce(oldUpdate.promise)
    .mockReturnValueOnce(newUpdate.promise);
  await mountProvider();
  let updatingOldAccount!: Promise<void>;
  await act(async () => {
    updatingOldAccount = auth.updateProfile({
      name: updatedUser.name,
      email: updatedUser.email,
    });
  });
  await act(async () => auth.login(otherUser.email, 'example-password'));
  const newSyncSession = auth.getSyncSession();
  expect(newSyncSession).toMatchObject({
    userId: '2',
    accessToken: signInResponse.access_token,
  });
  expect(newSyncSession?.isCurrent()).toBe(true);
  let updatingNewAccount!: Promise<void>;
  await act(async () => {
    updatingNewAccount = auth.updateProfile({
      name: changedOtherUser.name,
      email: changedOtherUser.email,
    });
  });
  expect(newSyncSession?.isCurrent()).toBe(false);
  await act(async () => {
    oldUpdate.resolve({
      access_token: 'old-account-updated-session',
      token_type: 'bearer',
      user: updatedUser,
    });
    await updatingOldAccount;
  });
  expect(auth.user).toEqual(otherUser);
  expect(auth.getSyncSession()).toBeNull();
  await expect(auth.changePassword({
    current_password: 'old-example',
    new_password: 'new-example',
  })).rejects.toThrow('Please wait for your current account update');
  expect(service.changeCurrentPassword).not.toHaveBeenCalled();
  await act(async () => {
    newUpdate.resolve({
      access_token: 'new-account-updated-session',
      token_type: 'bearer',
      user: changedOtherUser,
    });
    await updatingNewAccount;
  });
  expect(auth.user).toEqual(changedOtherUser);
  expect(auth.getSyncSession()).toMatchObject({
    userId: '2',
    accessToken: 'new-account-updated-session',
  });
  expect(storage.saveSession).toHaveBeenCalledTimes(2);
  expect(storage.saveSession).toHaveBeenLastCalledWith(
    'new-account-updated-session',
    changedOtherUser,
  );
});

test('returning to the foreground retries a temporary backend failure before permitting sync', async () => {
  networkState = { ...networkState, isOnline: true, isConnected: true };
  jest.mocked(service.getCurrentUser).mockRejectedValueOnce(new TypeError('Network request failed'));
  await mountProvider();
  expect(auth.getSyncSession()).toBeNull();
  await act(async () => onAppState('active'));
  expect(service.getCurrentUser).toHaveBeenCalledTimes(2);
  expect(auth.sessionValidated).toBe(true);
  expect(auth.getSyncSession()?.isCurrent()).toBe(true);
  expect(storage.clearAccessToken).not.toHaveBeenCalled();
});

test('a validation response from an earlier connection cannot authorize the new connection', async () => {
  networkState = { ...networkState, isOnline: true, isConnected: true };
  const firstCheck = deferred<AuthUser>();
  const secondCheck = deferred<AuthUser>();
  jest.mocked(service.getCurrentUser)
    .mockReturnValueOnce(firstCheck.promise)
    .mockReturnValueOnce(secondCheck.promise);
  const renderer = await mountProvider();
  await setOnline(renderer, false);
  await setOnline(renderer, true);
  await act(async () => firstCheck.resolve(cachedUser));
  expect(auth.getSyncSession()).toBeNull();
  expect(storage.cacheSessionUser).not.toHaveBeenCalled();
  await act(async () => secondCheck.resolve(updatedUser));
  expect(auth.user).toEqual(updatedUser);
  expect(auth.getSyncSession()?.isCurrent()).toBe(true);
});

test('a failed compare-and-set cannot authorize a token replaced in secure storage', async () => {
  networkState = { ...networkState, isOnline: true, isConnected: true };
  jest.mocked(storage.cacheSessionUser).mockResolvedValueOnce(false);
  await mountProvider();
  expect(auth.getSyncSession()).toBeNull();
  expect(auth.sessionValidated).toBe(false);
});

test('an unavailable Keychain does not erase saved credentials', async () => {
  jest.mocked(storage.getStoredSession).mockRejectedValueOnce(new Error('Keychain unavailable'));
  await mountProvider();
  expect(auth.user).toBeNull();
  expect(auth.loading).toBe(false);
  expect(auth.accountNotice).toContain('could not be opened');
  expect(storage.clearAccessToken).not.toHaveBeenCalled();
});

test('account changes remain disabled while offline despite restoring local identity', async () => {
  await mountProvider();
  await expect(auth.updateProfile({ name: updatedUser.name, email: updatedUser.email })).rejects.toThrow('Connect to the internet');
  await expect(auth.changePassword({ current_password: 'old-example', new_password: 'new-example' })).rejects.toThrow('Connect to the internet');
  expect(service.updateCurrentUser).not.toHaveBeenCalled();
  expect(service.changeCurrentPassword).not.toHaveBeenCalled();
});
