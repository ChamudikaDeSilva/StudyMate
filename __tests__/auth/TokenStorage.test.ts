import * as Keychain from 'react-native-keychain';
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from '../../src/data/local/tokenStorage';

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));
beforeEach(() => jest.resetAllMocks());

test('logout waits for an in-progress session write and clears it afterwards', async () => {
  let complete!: () => void;
  let stored: string | null = 'old-session';
  jest
    .mocked(Keychain.setGenericPassword)
    .mockImplementationOnce(async (_username, token) => {
      await new Promise<void>(resolve => {
        complete = resolve;
      });
      stored = token;
      return {
        service: 'learnloop.auth',
        storage: Keychain.STORAGE_TYPE?.AES_GCM_NO_AUTH,
      } as Awaited<ReturnType<typeof Keychain.setGenericPassword>>;
    });
  jest
    .mocked(Keychain.resetGenericPassword)
    .mockImplementationOnce(async () => {
      stored = null;
      return true;
    });
  jest
    .mocked(Keychain.getGenericPassword)
    .mockImplementation(async () =>
      stored
        ? {
            username: 'access_token',
            password: stored,
            service: 'learnloop.auth',
            storage: 'KeystoreAESGCM' as Keychain.STORAGE_TYPE,
          }
        : false,
    );
  const write = saveAccessToken('new-session');
  await Promise.resolve();
  const clear = clearAccessToken();
  expect(Keychain.resetGenericPassword).not.toHaveBeenCalled();
  complete();
  await Promise.all([write, clear]);
  expect(await getAccessToken()).toBeNull();
});

test('a failed native write is reported and does not block later cleanup', async () => {
  jest.mocked(Keychain.setGenericPassword).mockResolvedValueOnce(false);
  jest.mocked(Keychain.resetGenericPassword).mockResolvedValueOnce(true);
  await expect(saveAccessToken('new-session')).rejects.toThrow(
    'Unable to save',
  );
  await expect(clearAccessToken()).resolves.toBeUndefined();
  expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(1);
});
