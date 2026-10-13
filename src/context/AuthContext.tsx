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
  getAccessToken,
  saveAccessToken,
} from '../data/local/tokenStorage';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  accountNotice?: string;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountNotice, setAccountNotice] = useState('');
  const sessionRevision = useRef(0);
  const accountUpdatePending = useRef(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getAccessToken();
        setUser(token ? await getCurrentUser() : null);
      } catch {
        await clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const revision = ++sessionRevision.current;
    setUser(null);
    await clearAccessToken();
    if (sessionRevision.current !== revision) {
      return;
    }
    const response = await loginUser({ email, password });
    if (sessionRevision.current !== revision) {
      return;
    }
    await saveAccessToken(response.access_token);
    if (sessionRevision.current === revision) {
      setUser(response.user);
      setAccountNotice('');
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const revision = ++sessionRevision.current;
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
      await saveAccessToken(response.access_token);
      if (sessionRevision.current === revision) {
        setUser(response.user);
        setAccountNotice('');
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    const revision = ++sessionRevision.current;
    await logoutUser();
    if (sessionRevision.current === revision) {
      setUser(null);
      setAccountNotice('');
    }
  }, []);

  const updateAccount = useCallback(
    async (operation: () => Promise<LoginResponse>, savedNotice: string) => {
      if (!user) {
        throw new Error('Sign in to update your account.');
      }
      if (accountUpdatePending.current) {
        throw new Error('Please wait for your current account update.');
      }
      accountUpdatePending.current = true;
      const revision = sessionRevision.current;
      try {
        let response: LoginResponse;
        try {
          response = await operation();
        } catch (error) {
          if (
            error instanceof ApiError &&
            error.status === 401 &&
            sessionRevision.current === revision
          ) {
            sessionRevision.current += 1;
            setAccountNotice(
              'Your session expired. Sign in again to update your account.',
            );
            setUser(null);
            try {
              await clearAccessToken();
            } catch {
              // The server already rejects this expired or revoked session.
            }
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
          await saveAccessToken(response.access_token);
        } catch {
          if (sessionRevision.current !== revision) {
            return;
          }
          // The server committed the change. Do not resubmit the old password.
          sessionRevision.current += 1;
          setAccountNotice(savedNotice);
          setUser(null);
          try {
            await clearAccessToken();
          } catch {
            // Credential changes revoke the previous bearer token on the server.
          }
          throw new Error(savedNotice);
        }
        if (sessionRevision.current === revision) {
          setUser(current =>
            current?.id === user.id ? response.user : current,
          );
        }
      } finally {
        accountUpdatePending.current = false;
      }
    },
    [user],
  );

  const updateProfile = useCallback(
    (request: UpdateProfileRequest) =>
      updateAccount(
        () => updateCurrentUser(request),
        'Your profile was updated, but this device could not save the session. Sign in again with your updated email address.',
      ),
    [updateAccount],
  );

  const changePassword = useCallback(
    (request: ChangePasswordRequest) =>
      updateAccount(
        () => changeCurrentPassword(request),
        'Your password was changed, but this device could not save the session. Sign in again with your new password.',
      ),
    [updateAccount],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      accountNotice,
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
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
