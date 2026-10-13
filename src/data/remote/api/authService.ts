import { AuthUser } from '../../../domain/models/AuthUser';

import {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateProfileRequest,
} from './authTypes';

import { apiRequest } from './apiClient';

import { clearAccessToken } from '../../local/tokenStorage';

export const registerUser = async (
  request: RegisterRequest,
): Promise<AuthUser> => {
  return apiRequest<AuthUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const loginUser = async (
  request: LoginRequest,
): Promise<LoginResponse> => {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return response;
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  return apiRequest<AuthUser>('/auth/me', {
    method: 'GET',
    authenticated: true,
  });
};

export const logoutUser = async (): Promise<void> => {
  await clearAccessToken();
};

export const updateCurrentUser = (
  request: UpdateProfileRequest,
): Promise<LoginResponse> =>
  apiRequest<LoginResponse>('/auth/me', {
    method: 'PATCH',
    authenticated: true,
    body: JSON.stringify({
      ...request,
      name: request.name.trim(),
      email: request.email.trim().toLowerCase(),
    }),
  });

export const changeCurrentPassword = (
  request: ChangePasswordRequest,
): Promise<LoginResponse> =>
  apiRequest<LoginResponse>('/auth/change-password', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(request),
  });
