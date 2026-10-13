import * as Keychain from 'react-native-keychain';
import { AuthUser } from '../../domain/models/AuthUser';

const TOKEN_SERVICE = 'learnloop.auth';
const SESSION_USERNAME = 'auth_session';

export interface StoredAuthSession {
  accessToken: string;
  user: AuthUser | null;
}

interface SessionRecord {
  version: 1;
  accessToken: string;
  user: AuthUser;
}

// Keep reads, refreshed sessions, and logout in their requested order. In
// particular, a delayed profile cache write must not restore a cleared session.
let pendingMutation: Promise<void> = Promise.resolve();

const withSessionStorage = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = pendingMutation.then(operation);
  pendingMutation = result.then(
    () => {},
    () => {},
  );
  return result;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isAccessToken = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.trim() === value;

const isAuthUser = (value: unknown): value is AuthUser =>
  isRecord(value) &&
  Number.isSafeInteger(value.id) &&
  (value.id as number) > 0 &&
  typeof value.name === 'string' &&
  value.name.trim().length > 0 &&
  typeof value.email === 'string' &&
  value.email.trim().length > 0 &&
  typeof value.created_at === 'string' &&
  value.created_at.length > 0 &&
  typeof value.updated_at === 'string' &&
  value.updated_at.length > 0;

const readSession = async (): Promise<StoredAuthSession | null> => {
  const credentials = await Keychain.getGenericPassword({
    service: TOKEN_SERVICE,
  });

  if (!credentials || !isAccessToken(credentials.password)) {
    return null;
  }

  // Existing installs contain only a bearer token. They acquire an offline
  // identity after the next successful online validation or sign-in.
  if (credentials.username === 'access_token') {
    if (
      credentials.password.startsWith('{') ||
      credentials.password.startsWith('[')
    ) {
      return null;
    }
    return { accessToken: credentials.password, user: null };
  }

  if (credentials.username !== SESSION_USERNAME) {
    return null;
  }

  try {
    const record: unknown = JSON.parse(credentials.password);
    if (
      !isRecord(record) ||
      record.version !== 1 ||
      !isAccessToken(record.accessToken) ||
      !isAuthUser(record.user)
    ) {
      return null;
    }
    return { accessToken: record.accessToken, user: record.user };
  } catch {
    return null;
  }
};

const writeCredentials = async (
  username: string,
  password: string,
): Promise<void> => {
  const saved = await Keychain.setGenericPassword(username, password, {
    service: TOKEN_SERVICE,
  });
  if (!saved) {
    throw new Error('Unable to save your sign-in session.');
  }
};

const serializeSession = (accessToken: string, user: AuthUser): string => {
  if (!isAccessToken(accessToken) || !isAuthUser(user)) {
    throw new Error('Unable to save an invalid sign-in session.');
  }
  // Copy only profile fields: passwords and unrelated response data never
  // become part of the offline identity, even if supplied at runtime.
  const record: SessionRecord = {
    version: 1,
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
  return JSON.stringify(record);
};

export const getStoredSession = (): Promise<StoredAuthSession | null> =>
  withSessionStorage(readSession);

export const saveSession = async (
  accessToken: string,
  user: AuthUser,
): Promise<void> => {
  const serialized = serializeSession(accessToken, user);
  return withSessionStorage(() =>
    writeCredentials(SESSION_USERNAME, serialized),
  );
};

export const cacheSessionUser = async (
  accessToken: string,
  user: AuthUser,
): Promise<boolean> => {
  const serialized = serializeSession(accessToken, user);
  return withSessionStorage(async () => {
    const current = await readSession();
    if (
      !current ||
      current.accessToken !== accessToken ||
      (current.user !== null && current.user.id !== user.id)
    ) {
      return false;
    }
    await writeCredentials(SESSION_USERNAME, serialized);
    return true;
  });
};

// Kept for callers that only need the bearer token. Saving a bare token clears
// any previous cached identity rather than carrying it to another account.
export const saveAccessToken = (token: string): Promise<void> => {
  if (!isAccessToken(token)) {
    return Promise.reject(new Error('Unable to save an invalid sign-in session.'));
  }
  return withSessionStorage(() => writeCredentials('access_token', token));
};

export const getAccessToken = async (): Promise<string | null> =>
  (await getStoredSession())?.accessToken ?? null;

export const clearAccessToken = (): Promise<void> =>
  withSessionStorage(async () => {
    const cleared = await Keychain.resetGenericPassword({
      service: TOKEN_SERVICE,
    });
    if (!cleared) {
      throw new Error('Unable to clear your sign-in session.');
    }
  });
