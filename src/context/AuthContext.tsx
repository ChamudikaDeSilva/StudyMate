import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {AuthUser} from '../domain/models/AuthUser';

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../data/remote/api/authService';

import {
  clearAccessToken,
  getAccessToken,
} from '../data/local/tokenStorage';


interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<void>;

  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;

  logout: () => Promise<void>;
}


export const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);


interface AuthProviderProps {
  children: ReactNode;
}


export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] =
    useState<AuthUser | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);


  const restoreSession =
    useCallback(
      async () => {
        try {
          const token =
            await getAccessToken();

          if (!token) {
            setUser(null);
            return;
          }

          const currentUser =
            await getCurrentUser();

          setUser(
            currentUser,
          );
        } catch {
          await clearAccessToken();

          setUser(null);
        } finally {
          setLoading(false);
        }
      },
      [],
    );


  useEffect(() => {
    restoreSession();
  }, [restoreSession]);


  const login =
    useCallback(
      async (
        email: string,
        password: string,
      ) => {
        const authenticatedUser =
          await loginUser({
            email,
            password,
          });

        setUser(
          authenticatedUser,
        );
      },
      [],
    );


  const register =
    useCallback(
      async (
        name: string,
        email: string,
        password: string,
      ) => {
        await registerUser({
          name,
          email,
          password,
        });

        const authenticatedUser =
          await loginUser({
            email,
            password,
          });

        setUser(
          authenticatedUser,
        );
      },
      [],
    );


  const logout =
    useCallback(
      async () => {
        await logoutUser();

        setUser(null);
      },
      [],
    );


  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
    ],
  );


  return (
    <AuthContext.Provider
      value={value}>
      {children}
    </AuthContext.Provider>
  );
};