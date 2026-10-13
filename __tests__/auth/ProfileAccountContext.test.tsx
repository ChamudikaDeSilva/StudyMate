import React from 'react';
import { AppState } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { AuthProvider } from '../../src/context/AuthContext';
import { useAuth } from '../../src/hooks/useAuth';
import * as service from '../../src/data/remote/api/authService';
import * as storage from '../../src/data/local/tokenStorage';
import { LoginResponse } from '../../src/data/remote/api/authTypes';
import { ApiError } from '../../src/data/remote/api/apiClient';

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
  cacheSessionUser: jest.fn(),
  saveSession: jest.fn(),
  clearAccessToken: jest.fn(),
}));
jest.mock('../../src/hooks/useNetwork', () => ({
  useNetwork: () => ({ isOnline: true, initialized: true }),
}));
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));

const originalUser = {
  id: 1,
  name: 'Alex Student',
  email: 'alex@example.com',
  created_at: '2026-10-12T10:00:00',
  updated_at: '2026-10-12T10:00:00',
};
const updatedUser = {
  ...originalUser,
  name: 'Alex Taylor',
  email: 'new@example.com',
  updated_at: '2026-10-12T11:00:00',
};
const response: LoginResponse = {
  user: updatedUser,
  access_token: 'fresh-session',
  token_type: 'bearer',
};
const passwordRequest = {
  current_password: 'old-password',
  new_password: 'new-password',
};
let auth!: ReturnType<typeof useAuth>;
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

const ObserveAuth = () => {
  auth = useAuth();
  return null;
};
const mountProvider = async () => {
  await act(async () => {
    mounted.push(
      ReactTestRenderer.create(
        <AuthProvider>
          <ObserveAuth />
        </AuthProvider>,
      ),
    );
  });
};
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(complete => {
    resolve = complete;
  });
  return { promise, resolve };
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  jest.mocked(storage.getStoredSession).mockResolvedValue({ accessToken: 'original-session', user: originalUser });
  jest.mocked(storage.saveSession).mockResolvedValue(undefined);
  jest.mocked(storage.cacheSessionUser).mockResolvedValue(true);
  jest.mocked(storage.clearAccessToken).mockResolvedValue(undefined);
  jest.mocked(service.getCurrentUser).mockResolvedValue(originalUser);
  jest
    .mocked(service.loginUser)
    .mockResolvedValue({ ...response, user: originalUser });
  jest.mocked(service.logoutUser).mockResolvedValue(undefined);
  jest.mocked(service.updateCurrentUser).mockResolvedValue(response);
  jest.mocked(service.changeCurrentPassword).mockResolvedValue(response);
});
afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
});

test('publishes updated name/email only after securely storing the fresh session', async () => {
  const pendingSave = deferred<void>();
  jest.mocked(storage.saveSession).mockReturnValueOnce(pendingSave.promise);
  await mountProvider();
  let update!: Promise<void>;
  await act(async () => {
    update = auth.updateProfile({
      name: updatedUser.name,
      email: updatedUser.email,
      current_password: 'old-password',
    });
  });
  expect(storage.saveSession).toHaveBeenCalledWith(response.access_token, response.user);
  expect(auth.user).toEqual(originalUser);
  await act(async () => {
    pendingSave.resolve();
    await update;
  });
  expect(auth.user).toEqual(updatedUser);
});

test('failed profile changes keep the current session and allow a corrected retry', async () => {
  jest
    .mocked(service.updateCurrentUser)
    .mockRejectedValueOnce(new Error('Email already in use.'));
  await mountProvider();
  await act(async () => {
    await expect(
      auth.updateProfile({ name: updatedUser.name, email: updatedUser.email }),
    ).rejects.toThrow('Email already in use.');
  });
  expect(auth.user).toEqual(originalUser);
  expect(storage.saveSession).not.toHaveBeenCalled();
  await act(async () => {
    await auth.updateProfile({
      name: updatedUser.name,
      email: updatedUser.email,
    });
  });
  expect(auth.user).toEqual(updatedUser);
});

test('password changes replace the bearer session and keep the account signed in', async () => {
  await mountProvider();
  await act(async () => {
    await auth.changePassword(passwordRequest);
  });
  expect(service.changeCurrentPassword).toHaveBeenCalledWith(passwordRequest, 'original-session');
  expect(storage.saveSession).toHaveBeenCalledWith(response.access_token, response.user);
  expect(auth.user).toEqual(updatedUser);
  expect(service.logoutUser).not.toHaveBeenCalled();
});

test('a rejected current password does not change the account or stored session', async () => {
  jest
    .mocked(service.changeCurrentPassword)
    .mockRejectedValueOnce(new Error('Current password is incorrect.'));
  await mountProvider();
  await act(async () => {
    await expect(auth.changePassword(passwordRequest)).rejects.toThrow(
      'Current password is incorrect.',
    );
  });
  expect(auth.user).toEqual(originalUser);
  expect(storage.saveSession).not.toHaveBeenCalled();
});

test('signed-out account edits are rejected before any request', async () => {
  jest.mocked(storage.getStoredSession).mockResolvedValueOnce(null);
  await mountProvider();
  await expect(
    auth.updateProfile({ name: 'Alex', email: originalUser.email }),
  ).rejects.toThrow('Sign in');
  await expect(auth.changePassword(passwordRequest)).rejects.toThrow('Sign in');
  expect(service.updateCurrentUser).not.toHaveBeenCalled();
  expect(service.changeCurrentPassword).not.toHaveBeenCalled();
});

test('different account forms cannot submit mutations concurrently', async () => {
  const pending = deferred<LoginResponse>();
  jest.mocked(service.updateCurrentUser).mockReturnValueOnce(pending.promise);
  await mountProvider();
  let update!: Promise<void>;
  act(() => {
    update = auth.updateProfile({
      name: updatedUser.name,
      email: updatedUser.email,
    });
  });
  await expect(auth.changePassword(passwordRequest)).rejects.toThrow(
    'Please wait',
  );
  expect(service.changeCurrentPassword).not.toHaveBeenCalled();
  await act(async () => {
    pending.resolve(response);
    await update;
  });
});

test('a response arriving after logout cannot restore the account or save its token', async () => {
  const pending = deferred<LoginResponse>();
  jest.mocked(service.updateCurrentUser).mockReturnValueOnce(pending.promise);
  await mountProvider();
  let update!: Promise<void>;
  act(() => {
    update = auth.updateProfile({
      name: updatedUser.name,
      email: updatedUser.email,
    });
  });
  await act(async () => {
    await auth.logout();
  });
  await act(async () => {
    pending.resolve(response);
    await update;
  });
  expect(auth.user).toBeNull();
  expect(storage.saveSession).not.toHaveBeenCalled();
});

test('logout during token persistence prevents the updated account being restored', async () => {
  const pendingSave = deferred<void>();
  jest.mocked(storage.saveSession).mockReturnValueOnce(pendingSave.promise);
  await mountProvider();
  let update!: Promise<void>;
  await act(async () => {
    update = auth.changePassword(passwordRequest);
  });
  await act(async () => {
    await auth.logout();
  });
  await act(async () => {
    pendingSave.resolve();
    await update;
  });
  expect(auth.user).toBeNull();
});

test('a stale account response cannot overwrite a newer sign-in', async () => {
  const pending = deferred<LoginResponse>();
  const otherUser = { ...originalUser, id: 2, name: 'Another Student' };
  jest.mocked(service.updateCurrentUser).mockReturnValueOnce(pending.promise);
  jest
    .mocked(service.loginUser)
    .mockResolvedValueOnce({ ...response, user: otherUser });
  await mountProvider();
  let update!: Promise<void>;
  act(() => {
    update = auth.updateProfile({
      name: updatedUser.name,
      email: updatedUser.email,
    });
  });
  await act(async () => {
    await auth.login('other@example.com', 'password');
  });
  await act(async () => {
    pending.resolve(response);
    await update;
  });
  expect(auth.user).toEqual(otherUser);
  expect(storage.saveSession).toHaveBeenCalledTimes(1);
  expect(storage.saveSession).toHaveBeenCalledWith(response.access_token, otherUser);
});

test('a committed password change with failed secure storage directs the user to sign in again', async () => {
  jest
    .mocked(storage.saveSession)
    .mockRejectedValueOnce(new Error('Keychain unavailable.'));
  await mountProvider();
  await act(async () => {
    await expect(auth.changePassword(passwordRequest)).rejects.toThrow(
      'Your password was changed',
    );
  });
  expect(auth.user).toBeNull();
  expect(auth.accountNotice).toContain('new password');
  expect(storage.clearAccessToken).toHaveBeenCalledTimes(1);
  expect(service.changeCurrentPassword).toHaveBeenCalledTimes(1);
  await act(async () => {
    await auth.login(originalUser.email, 'new-password');
  });
  expect(auth.accountNotice).toBe('');
});

test('an unexpected account response is never saved or published', async () => {
  jest
    .mocked(service.updateCurrentUser)
    .mockResolvedValueOnce({ ...response, user: { ...updatedUser, id: 999 } });
  await mountProvider();
  await act(async () => {
    await expect(
      auth.updateProfile({ name: updatedUser.name, email: updatedUser.email }),
    ).rejects.toThrow('unexpected account');
  });
  expect(auth.user).toEqual(originalUser);
  expect(storage.saveSession).not.toHaveBeenCalled();
});

test('a delayed login response after logout cannot persist or restore a session', async () => {
  const pendingLogin = deferred<LoginResponse>();
  jest.mocked(service.loginUser).mockReturnValueOnce(pendingLogin.promise);
  await mountProvider();
  let signIn!: Promise<void>;
  await act(async () => {
    signIn = auth.login(originalUser.email, 'password');
  });
  await act(async () => {
    await auth.logout();
  });
  await act(async () => {
    pendingLogin.resolve(response);
    await signIn;
  });
  expect(auth.user).toBeNull();
  expect(storage.saveSession).not.toHaveBeenCalled();
});

test('overlapping sign-ins persist only the latest login response', async () => {
  const first = deferred<LoginResponse>();
  const second = deferred<LoginResponse>();
  const secondResponse = {
    ...response,
    user: { ...updatedUser, id: 2 },
    access_token: 'second-session',
  };
  jest
    .mocked(service.loginUser)
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  await mountProvider();
  let firstSignIn!: Promise<void>;
  let secondSignIn!: Promise<void>;
  await act(async () => {
    firstSignIn = auth.login('first@example.com', 'password');
  });
  await act(async () => {
    secondSignIn = auth.login('second@example.com', 'password');
  });
  await act(async () => {
    second.resolve(secondResponse);
    await secondSignIn;
  });
  await act(async () => {
    first.resolve(response);
    await firstSignIn;
  });
  expect(auth.user).toEqual(secondResponse.user);
  expect(storage.saveSession).toHaveBeenCalledTimes(1);
  expect(storage.saveSession).toHaveBeenCalledWith(
    secondResponse.access_token,
    secondResponse.user,
  );
});

test('an externally revoked session returns to sign in with a clear explanation', async () => {
  jest
    .mocked(service.changeCurrentPassword)
    .mockRejectedValueOnce(new ApiError('Sign in again.', 401));
  await mountProvider();
  await act(async () => {
    await expect(auth.changePassword(passwordRequest)).rejects.toThrow(
      'Sign in again.',
    );
  });
  expect(auth.user).toBeNull();
  expect(auth.accountNotice).toContain('session expired');
  expect(storage.clearAccessToken).toHaveBeenCalledTimes(1);
});
