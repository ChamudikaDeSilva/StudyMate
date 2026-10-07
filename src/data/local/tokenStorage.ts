import * as Keychain from 'react-native-keychain';

const TOKEN_SERVICE = 'learnloop.auth';

export const saveAccessToken = async (
  token: string,
): Promise<void> => {
  await Keychain.setGenericPassword(
    'access_token',
    token,
    {
      service: TOKEN_SERVICE,
    },
  );
};

export const getAccessToken = async (): Promise<
  string | null
> => {
  const credentials =
    await Keychain.getGenericPassword({
      service: TOKEN_SERVICE,
    });

  if (!credentials) {
    return null;
  }

  return credentials.password;
};

export const clearAccessToken =
  async (): Promise<void> => {
    await Keychain.resetGenericPassword({
      service: TOKEN_SERVICE,
    });
  };