import * as Keychain from 'react-native-keychain';
import {
  cacheSessionUser,
  clearAccessToken,
  getAccessToken,
  getStoredSession,
  saveAccessToken,
  saveSession,
} from '../../src/data/local/tokenStorage';
import { AuthUser } from '../../src/domain/models/AuthUser';

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

const user: AuthUser = {
  id: 7,
  name: 'Alex Student',
  email: 'alex@example.com',
  created_at: '2026-10-12T10:00:00',
  updated_at: '2026-10-12T10:00:00',
};
const changedUser = { ...user, name: 'Alex Taylor' };
const otherUser = { ...user, id: 8, email: 'other@example.com' };
type Credentials = Exclude<
  Awaited<ReturnType<typeof Keychain.getGenericPassword>>,
  false
>;
let credentials: Credentials | false;

const storedCredentials = (username: string, password: string): Credentials => ({
  username,
  password,
  service: 'learnloop.auth',
  storage: 'KeystoreAESGCM' as Keychain.STORAGE_TYPE,
});
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(complete => {
    resolve = complete;
  });
  return { promise, resolve };
};

beforeEach(() => {
  jest.resetAllMocks();
  credentials = false;
  jest.mocked(Keychain.getGenericPassword).mockImplementation(async () =>
    credentials,
  );
  jest
    .mocked(Keychain.setGenericPassword)
    .mockImplementation(async (username, password) => {
      credentials = storedCredentials(username, password);
      return { service: 'learnloop.auth', storage: credentials.storage };
    });
  jest.mocked(Keychain.resetGenericPassword).mockImplementation(async () => {
    credentials = false;
    return true;
  });
});

test('reads existing bearer-only credentials without inventing an offline identity', async () => {
  credentials = storedCredentials('access_token', 'legacy-session');
  await expect(getStoredSession()).resolves.toEqual({
    accessToken: 'legacy-session',
    user: null,
  });
  await expect(getAccessToken()).resolves.toBe('legacy-session');
  expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
});

test('stores the token and validated identity in one secured record', async () => {
  await saveSession('paired-session', user);
  expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(1);
  expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
    'auth_session',
    JSON.stringify({ version: 1, accessToken: 'paired-session', user }),
    { service: 'learnloop.auth' },
  );
  await expect(getStoredSession()).resolves.toEqual({
    accessToken: 'paired-session',
    user,
  });
  await expect(getAccessToken()).resolves.toBe('paired-session');
});

test('copies only identity fields into the secured offline snapshot', async () => {
  await saveSession('paired-session', {
    ...user,
    current_password: 'example-not-saved',
  } as AuthUser);
  await expect(getStoredSession()).resolves.toEqual({
    accessToken: 'paired-session',
    user,
  });
  expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
    'auth_session',
    JSON.stringify({ version: 1, accessToken: 'paired-session', user }),
    { service: 'learnloop.auth' },
  );
});

test.each([
  ['malformed JSON', '{'],
  ['unexpected version', JSON.stringify({ version: 2, accessToken: 'a', user })],
  ['missing token', JSON.stringify({ version: 1, user })],
  ['blank token', JSON.stringify({ version: 1, accessToken: '', user })],
  ['non-string token', JSON.stringify({ version: 1, accessToken: 42, user })],
  ['missing user', JSON.stringify({ version: 1, accessToken: 'a' })],
  ['null user', JSON.stringify({ version: 1, accessToken: 'a', user: null })],
  [
    'invalid user ID',
    JSON.stringify({ version: 1, accessToken: 'a', user: { ...user, id: -1 } }),
  ],
  [
    'fractional user ID',
    JSON.stringify({ version: 1, accessToken: 'a', user: { ...user, id: 1.5 } }),
  ],
  [
    'missing profile field',
    JSON.stringify({
      version: 1,
      accessToken: 'a',
      user: { ...user, email: undefined },
    }),
  ],
  [
    'invalid timestamp',
    JSON.stringify({
      version: 1,
      accessToken: 'a',
      user: { ...user, updated_at: null },
    }),
  ],
])('rejects a structured record with %s without sending JSON as a bearer token', async (_label, password) => {
  credentials = storedCredentials('auth_session', password);
  await expect(getStoredSession()).resolves.toBeNull();
  await expect(getAccessToken()).resolves.toBeNull();
});

test('rejects structured data mislabeled as a legacy bearer token', async () => {
  credentials = storedCredentials(
    'access_token',
    JSON.stringify({ version: 1, accessToken: 'paired-session', user }),
  );
  await expect(getAccessToken()).resolves.toBeNull();
});

test('validating a legacy token adds its identity only while the same token is stored', async () => {
  await saveAccessToken('legacy-session');
  await expect(cacheSessionUser('legacy-session', user)).resolves.toBe(true);
  await expect(getStoredSession()).resolves.toEqual({
    accessToken: 'legacy-session',
    user,
  });
});

test('a refreshed profile updates the matching secured identity', async () => {
  await saveSession('paired-session', user);
  await expect(cacheSessionUser('paired-session', changedUser)).resolves.toBe(true);
  await expect(getStoredSession()).resolves.toEqual({
    accessToken: 'paired-session',
    user: changedUser,
  });
});

test('a delayed validation cannot overwrite another token or its identity', async () => {
  await saveSession('new-session', otherUser);
  jest.mocked(Keychain.setGenericPassword).mockClear();
  await expect(cacheSessionUser('old-session', changedUser)).resolves.toBe(false);
  await expect(getStoredSession()).resolves.toEqual({
    accessToken: 'new-session',
    user: otherUser,
  });
  expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
});

test('the same bearer token cannot be reassigned to another cached account', async () => {
  await saveSession('paired-session', user);
  await expect(cacheSessionUser('paired-session', otherUser)).resolves.toBe(false);
  await expect(getStoredSession()).resolves.toEqual({
    accessToken: 'paired-session',
    user,
  });
});

test('saving a bare token never retains the previous account snapshot', async () => {
  await saveSession('first-session', user);
  await saveAccessToken('replacement-session');
  await expect(getStoredSession()).resolves.toEqual({
    accessToken: 'replacement-session',
    user: null,
  });
});

test('logout waits for an in-progress session write and clears the token and identity afterwards', async () => {
  const pending = deferred<void>();
  jest
    .mocked(Keychain.setGenericPassword)
    .mockImplementationOnce(async (username, password) => {
      await pending.promise;
      credentials = storedCredentials(username, password);
      return { service: 'learnloop.auth', storage: credentials.storage };
    });
  const write = saveSession('paired-session', user);
  await Promise.resolve();
  const clear = clearAccessToken();
  expect(Keychain.resetGenericPassword).not.toHaveBeenCalled();
  pending.resolve();
  await Promise.all([write, clear]);
  await expect(getStoredSession()).resolves.toBeNull();
});

test('a cached identity write queued after logout cannot recreate a session', async () => {
  await saveSession('paired-session', user);
  const clear = clearAccessToken();
  const update = cacheSessionUser('paired-session', changedUser);
  await clear;
  await expect(update).resolves.toBe(false);
  await expect(getStoredSession()).resolves.toBeNull();
});

test('failed native writes are reported without pairing an old token with a new user', async () => {
  await saveSession('first-session', user);
  jest.mocked(Keychain.setGenericPassword).mockResolvedValueOnce(false);
  await expect(saveSession('second-session', otherUser)).rejects.toThrow(
    'Unable to save',
  );
  await expect(getStoredSession()).resolves.toEqual({
    accessToken: 'first-session',
    user,
  });
  await expect(clearAccessToken()).resolves.toBeUndefined();
  await expect(getStoredSession()).resolves.toBeNull();
});

test('a failed native read is reported and does not block subsequent cleanup', async () => {
  jest.mocked(Keychain.getGenericPassword).mockRejectedValueOnce(
    new Error('Secure storage unavailable.'),
  );
  await expect(getStoredSession()).rejects.toThrow('Secure storage unavailable.');
  await expect(clearAccessToken()).resolves.toBeUndefined();
});

test('invalid identity data is rejected before writing secure storage', async () => {
  await expect(saveSession('paired-session', { ...user, id: 0 })).rejects.toThrow(
    'invalid sign-in session',
  );
  expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
});

test('a failed native logout is reported rather than claiming credentials were removed', async () => {
  jest.mocked(Keychain.resetGenericPassword).mockResolvedValueOnce(false);
  await expect(clearAccessToken()).rejects.toThrow('Unable to clear');
});
