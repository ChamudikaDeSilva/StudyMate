import * as Keychain from 'react-native-keychain';

const TOKEN_SERVICE = 'learnloop.auth';

// Keep logout and refreshed-session writes in the order they were requested.
let pendingMutation: Promise<void> = Promise.resolve();

const mutateToken = (operation: () => Promise<void>): Promise<void> => {
  const result = pendingMutation.then(operation);
  pendingMutation = result.catch(() => {});
  return result;
};

export const saveAccessToken = async (token: string): Promise<void> => {
  await mutateToken(async () => {
    const saved = await Keychain.setGenericPassword('access_token', token, {
      service: TOKEN_SERVICE,
    });
    if (!saved) {
      throw new Error('Unable to save your sign-in session.');
    }
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  await pendingMutation;
  const credentials = await Keychain.getGenericPassword({
    service: TOKEN_SERVICE,
  });

  if (!credentials) {
    return null;
  }

  return credentials.password;
};

export const clearAccessToken = async (): Promise<void> => {
  await mutateToken(async () => {
    await Keychain.resetGenericPassword({
      service: TOKEN_SERVICE,
    });
  });
};
