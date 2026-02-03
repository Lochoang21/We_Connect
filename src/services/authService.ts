// src/services/authService.ts

import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  CheckCodeRequest,
  EmailRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  User
} from "../types/auth";
import { privateAPI, publicAPI } from "./apiService";
import { tokenStorage } from "../utils/tokenStorage";

// Auth API endpoints
export const authAPI = {
  // Authentication
  login: (data: LoginRequest) =>
    publicAPI.post<ApiResponse<LoginResponse>>("/api/v1/auth/login", data),

  getProfile: () =>
    privateAPI.get<ApiResponse<User>>("/api/v1/auth/profile"),

  // Registration & Activation
  register: (data: RegisterRequest) =>
    publicAPI.post<ApiResponse<{ id: string }>>("/api/v1/auth/register", data),
  checkCode: (data: CheckCodeRequest) =>
    publicAPI.post<ApiResponse<{ isBeforeCheck: boolean }>>("/api/v1/auth/check-code", data),

  retryActive: (data: EmailRequest) =>
    publicAPI.post<ApiResponse<{ id: string }>>("/api/v1/auth/retry-active", data),

  // Password Management
  retryPassword: (data: EmailRequest) =>
    publicAPI.post<ApiResponse<{ id: string; email: string }>>("/api/v1/auth/retry-password", data),
  changePassword: (data: ChangePasswordRequest) =>
    publicAPI.post<ApiResponse<{ isBeforeCheck: boolean }>>("/api/v1/auth/change-password", data),

  // Token Management
  refreshToken: (data: RefreshTokenRequest) =>
    publicAPI.post<ApiResponse<LoginResponse>>("/api/v1/auth/refresh-token", data),
};

// Service layer với error handling
export const authService = {
  // Login
  async login(data: LoginRequest) {
    const response = await authAPI.login(data);
    return response.data;
  },

  // Get Profile
  async getProfile() {
    const response = await authAPI.getProfile();
    return response.data;
  },

  // Register
  async register(data: RegisterRequest) {
    const response = await authAPI.register(data);
    return response.data;
  },

  // Check activation code
  async checkCode(data: CheckCodeRequest) {
    const response = await authAPI.checkCode(data);
    return response.data;
  },

  // Retry activation
  async retryActive(email: string) {
    const response = await authAPI.retryActive({ email });
    return response.data;
  },

  // Retry password (send reset code)
  async retryPassword(email: string) {
    const response = await authAPI.retryPassword({ email });
    return response.data;
  },

  // Change password
  async changePassword(data: ChangePasswordRequest) {
    const response = await authAPI.changePassword(data);
    return response.data;
  },

  // Refresh token
  async refreshToken(refreshToken: string) {
    const response = await authAPI.refreshToken({ refreshToken });
    return response.data;
  },

  // Logout (client-side only vì backend không có endpoint)
  async logout() {
    try {
      // Clear tokens với prefix
      tokenStorage.clearTokens();
    } catch (error) {
      console.error("Logout failed:", error);
      // Vẫn clear local storage dù có lỗi
      tokenStorage.clearTokens();
    }
  },
};
