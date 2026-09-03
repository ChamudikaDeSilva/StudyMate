import React, {
  createContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import {
  onAuthStateChanged,
  User,
} from '@react-native-firebase/auth';

import {
  getFirebaseAuth,
  loginUser,
  logoutUser,
  registerUser,
} from '../data/remote/firebase/authService';

interface AuthContextType {
  user: User | null;
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
  createContext<AuthContextType | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        getFirebaseAuth(),
        currentUser => {
          setUser(currentUser);
          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  const login = async (
    email: string,
    password: string,
  ) => {
    await loginUser(email, password);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ) => {
    await registerUser(
      name,
      email,
      password,
    );
  };

  const logout = async () => {
    await logoutUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};