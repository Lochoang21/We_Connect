// src/types/auth.ts

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  image?: string | null;
  bio?: string | null;
  isActive?: boolean;
  active?: number;
  is_active?: number | boolean;
  status?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CheckCodeRequest {
  id: string;
  code: string;
}

export interface EmailRequest {
  email: string;
}

export interface ChangePasswordRequest {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  image?: string;
  bio?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  errorCode: number | null;
}