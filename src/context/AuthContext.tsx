import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AuthUser } from '../domain/models/AuthUser';
import { SyncSession } from '../domain/models/SyncSession';
import { useNetwork } from '../hooks/useNetwork';
import { AppState } from 'react-native';
import { ApiError } from '../data/remote/api/apiClient';
import {
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateCurrentUser,
} from '../data/remote/api/authService';
import {
  ChangePasswordRequest,
  LoginResponse,
  UpdateProfileRequest,
} from '../data/remote/api/authTypes';
import {
  clearAccessToken,
  cacheSessionUser,
  getStoredSession,
  saveSession,
  StoredAuthSession,
} from '../data/local/tokenStorage';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  accountNotice?: string;
  sessionValidated: boolean;
  getSyncSession: () => SyncSession | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (request: UpdateProfileRequest) => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

interface SessionValidation {
  token: string;
  revision: number;
  networkEpoch: number;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountNotice, setAccountNotice] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [validation, setValidation] = useState<SessionValidation | null>(null);
  const { isOnline, initialized } = useNetwork();
  const session = useRef<StoredAuthSession | null>(null);
  const validatedSession = useRef<SessionValidation | null>(null);
  const network = useRef({ isOnline, initialized, epoch: 0 });
  if (
    network.current.isOnline !== isOnline ||
    network.current.initialized !== initialized
  ) {
    network.current = {
      isOnline,
      initialized,
      epoch: network.current.epoch + 1,
    };
  }
  const sessionRevision = useRef(0);
  const accountUpdatePending = useRef<number | null>(null);

  const publishValidation = useCallback((token: string) => {
    const next = {
      token,
      revision: sessionRevision.current,
      networkEpoch: network.current.epoch,
    };
    validatedSession.current = next;
    setValidation(next);
  }, []);

  const clearValidation = useCallback(() => {
    validatedSession.current = null;
    setValidation(null);
  }, []);

  const rejectSession = useCallback(
    async (notice: string, revision: number) => {
      if (sessionRevision.current !== revision) {
        return;
      }
      sessionRevision.current += 1;
      session.current = null;
      clearValidation();
      setUser(null);
      setAccountNotice(notice);
      try {
        await clearAccessToken();
      } catch {
        // Keep the rejected session out of memory even if native cleanup fails.
      }
    },
    [clearValidation],
  );

  useEffect(() => {
    let active = true;
    const revision = sessionRevision.current;
    const restoreSession = async () => {
      try {
        const stored = await getStoredSession();
        if (active && sessionRevision.current === revision) {
          session.current = stored;
          setUser(stored?.user ?? null);
        }
      } catch {
        // A storage or transport failure is not proof that credentials expired.
        if (active && sessionRevision.current === revision) {
          setAccountNotice(
            'Your saved session could not be opened. Please sign in again.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setHydrated(true);
        }
      }
    };
    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !initialized || !isOnline || !session.current) {
      return;
    }
    if (accountUpdatePending.current !== null) {
      return;
    }
    let active = true;
    const saved = session.current;
    const revision = sessionRevision.current;
    const networkEpoch = network.current.epoch;
    const isCurrent = () =>
      active &&
      sessionRevision.current === revision &&
      session.current?.accessToken === saved.accessToken &&
      network.current.epoch === networkEpoch &&
      network.current.isOnline;

    const verifySession = async () => {
      clearValidation();
      try {
        // Bind this check to its original token, even if another sign-in starts.
        const currentUser = await getCurrentUser(saved.accessToken);
        if (!isCurrent()) {
          return;
        }
        if (saved.user && saved.user.id !== currentUser.id) {
          await rejectSession(
            'Your saved account could not be verified. Please sign in again.',
            revision,
          );
          return;
        }
        if (
          !(await cacheSessionUser(saved.accessToken, currentUser)) ||
          !isCurrent()
        ) {
          return;
        }
        session.current = { accessToken: saved.accessToken, user: currentUser };
        setUser(currentUser);
        setAccountNotice('');
        publishValidation(saved.accessToken);
      } catch (error) {
        if (
          isCurrent() &&
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          await rejectSession(
            'Your session expired. Please sign in again.',
            revision,
          );
        }
        // Network failures and 5xx responses preserve the secured local session.
      }
    };
    verifySession();
    return () => {
      active = false;
    };
  }, [
    hydrated,
    initialized,
    isOnline,
    validationAttempt,
    clearValidation,
    publishValidation,
    rejectSession,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        setValidationAttempt(attempt => attempt + 1);
      }
    });
    return () => subscription.remove();
  }, []);

  const getSyncSession = useCallback((): SyncSession | null => {
    const saved = session.current;
    const verified = validatedSession.current;
    const revision = sessionRevision.current;
    const epoch = network.current.epoch;
    if (
      !saved?.user ||
      !verified ||
      accountUpdatePending.current !== null ||
      !network.current.initialized ||
      !network.current.isOnline ||
      verified.token !== saved.accessToken ||
      verified.revision !== revision ||
      verified.networkEpoch !== epoch
    ) {
      return null;
    }
    return {
      userId: String(saved.user.id),
      accessToken: saved.accessToken,
      isCurrent: () =>
        sessionRevision.current === revision &&
        session.current?.accessToken === saved.accessToken &&
        session.current?.user?.id === saved.user?.id &&
        accountUpdatePending.current === null &&
        network.current.epoch === epoch &&
        network.current.isOnline &&
        validatedSession.current?.token === saved.accessToken &&
        validatedSession.current?.revision === revision &&
        validatedSession.current?.networkEpoch === epoch,
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const revision = ++sessionRevision.current;
      accountUpdatePending.current = null;
      session.current = null;
      clearValidation();
      setUser(null);
      await clearAccessToken();
      if (sessionRevision.current !== revision) {
        return;
      }
      const response = await loginUser({ email, password });
      if (sessionRevision.current !== revision) {
        return;
      }
      await saveSession(response.access_token, response.user);
      if (sessionRevision.current === revision) {
        session.current = {
          accessToken: response.access_token,
          user: response.user,
        };
        setUser(response.user);
        setAccountNotice('');
        publishValidation(response.access_token);
      }
    },
    [clearValidation, publishValidation],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const revision = ++sessionRevision.current;
      accountUpdatePending.current = null;
      session.current = null;
      clearValidation();
      setUser(null);
      await clearAccessToken();
      if (sessionRevision.current !== revision) {
        return;
      }
      await registerUser({ name, email, password });
      if (sessionRevision.current !== revision) {
        return;
      }
      const response = await loginUser({ email, password });
      if (sessionRevision.current !== revision) {
        return;
      }
      await saveSession(response.access_token, response.user);
      if (sessionRevision.current === revision) {
        session.current = {
          accessToken: response.access_token,
          user: response.user,
        };
        setUser(response.user);
        setAccountNotice('');
        publishValidation(response.access_token);
      }
    },
    [clearValidation, publishValidation],
  );

  const logout = useCallback(async () => {
    const revision = ++sessionRevision.current;
    accountUpdatePending.current = null;
    session.current = null;
    clearValidation();
    setUser(null);
    await logoutUser();
    if (sessionRevision.current === revision) {
      setUser(null);
      setAccountNotice('');
    }
  }, [clearValidation]);

  const updateAccount = useCallback(
    async (
      operation: (token: string) => Promise<LoginResponse>,
      savedNotice: string,
    ) => {
      if (!user) {
        throw new Error('Sign in to update your account.');
      }
      if (accountUpdatePending.current !== null) {
        throw new Error('Please wait for your current account update.');
      }
      if (!network.current.isOnline) {
        throw new Error('Connect to the internet to update your account.');
      }
      const saved = session.current;
      if (!saved?.user || saved.user.id !== user.id || !getSyncSession()) {
        throw new Error(
          'Your session needs to be verified. Reconnect and try again.',
        );
      }
      const revision = ++sessionRevision.current;
      accountUpdatePending.current = revision;
      const networkEpoch = network.current.epoch;
      clearValidation();
      try {
        let response: LoginResponse;
        try {
          response = await operation(saved.accessToken);
        } catch (error) {
          if (
            error instanceof ApiError &&
            error.status === 401 &&
            sessionRevision.current === revision
          ) {
            await rejectSession(
              'Your session expired. Sign in again to update your account.',
              revision,
            );
          }
          throw error;
        }
        if (sessionRevision.current !== revision) {
          return;
        }
        if (
          response.user.id !== user.id ||
          !response.access_token ||
          response.token_type.toLowerCase() !== 'bearer'
        ) {
          throw new Error(
            'The server returned an unexpected account response.',
          );
        }
        try {
          await saveSession(response.access_token, response.user);
        } catch {
          if (sessionRevision.current !== revision) {
            return;
          }
          // The server committed the change. Do not resubmit the old password.
          await rejectSession(savedNotice, revision);
          throw new Error(savedNotice);
        }
        if (sessionRevision.current === revision) {
          session.current = {
            accessToken: response.access_token,
            user: response.user,
          };
          setUser(current =>
            current?.id === user.id ? response.user : current,
          );
          publishValidation(response.access_token);
        }
      } finally {
        if (accountUpdatePending.current === revision) {
          accountUpdatePending.current = null;
        }
        if (
          sessionRevision.current === revision &&
          !validatedSession.current &&
          session.current &&
          network.current.epoch === networkEpoch
        ) {
          // An ordinary validation/form error does not revoke the old session.
          publishValidation(session.current.accessToken);
        } else if (
          sessionRevision.current === revision &&
          !validatedSession.current &&
          network.current.isOnline
        ) {
          setValidationAttempt(attempt => attempt + 1);
        }
      }
    },
    [user, getSyncSession, clearValidation, publishValidation, rejectSession],
  );

  const updateProfile = useCallback(
    (request: UpdateProfileRequest) =>
      updateAccount(
        token => updateCurrentUser(request, token),
        'Your profile was updated, but this device could not save the session. Sign in again with your updated email address.',
      ),
    [updateAccount],
  );

  const changePassword = useCallback(
    (request: ChangePasswordRequest) =>
      updateAccount(
        token => changeCurrentPassword(request, token),
        'Your password was changed, but this device could not save the session. Sign in again with your new password.',
      ),
    [updateAccount],
  );

  const sessionValidated = Boolean(
    user &&
      isOnline &&
      initialized &&
      validation &&
      validation.token === session.current?.accessToken &&
      validation.revision === sessionRevision.current &&
      validation.networkEpoch === network.current.epoch,
  );
  const value = useMemo(
    () => ({
      user,
      loading,
      accountNotice,
      sessionValidated,
      getSyncSession,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [
      user,
      loading,
      accountNotice,
      sessionValidated,
      getSyncSession,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
