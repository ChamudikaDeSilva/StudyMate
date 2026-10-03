import {AuthUser} from '../../../domain/models/AuthUser';

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from './authTypes';

import {apiRequest} from './apiClient';

import {
  clearAccessToken,
  saveAccessToken,
} from '../../local/tokenStorage';


export const registerUser = async (
  request: RegisterRequest,
): Promise<AuthUser> => {
  return apiRequest<AuthUser>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(
        request,
      ),
    },
  );
};


export const loginUser = async (
  request: LoginRequest,
): Promise<AuthUser> => {
  const response =
    await apiRequest<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(
          request,
        ),
      },
    );

  await saveAccessToken(
    response.access_token,
  );

  return response.user;
};


export const getCurrentUser =
  async (): Promise<AuthUser> => {
    return apiRequest<AuthUser>(
      '/auth/me',
      {
        method: 'GET',
        authenticated: true,
      },
    );
  };


export const logoutUser =
  async (): Promise<void> => {
    await clearAccessToken();
  };