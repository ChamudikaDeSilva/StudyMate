import { AuthUser } from '../../../domain/models/AuthUser';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  current_password?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
