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
  User,
} from "../types/auth";
import { API } from "./apiService";
import { tokenStorage } from "../utils/tokenStorage";

// Auth API endpoints - sử dụng API từ apiService
export const authAPI = {
  // Authentication
  login: (data: LoginRequest) =>
    API.auth.login(data) as Promise<{ data: ApiResponse<LoginResponse> }>,

  getProfile: () =>
    API.auth.getProfile() as Promise<{ data: ApiResponse<User> }>,

  // Registration & Activation
  register: (data: RegisterRequest) =>
    API.auth.register(data) as Promise<{ data: ApiResponse<{ id: string }> }>,
  checkCode: (data: CheckCodeRequest) =>
    API.auth.checkCode(data) as Promise<{
      data: ApiResponse<{ isBeforeCheck: boolean }>;
    }>,

  retryActive: (data: EmailRequest) =>
    API.auth.retryActive(data) as Promise<{
      data: ApiResponse<{ id: string }>;
    }>,

  // Password Management
  retryPassword: (data: EmailRequest) =>
    API.auth.retryPassword(data) as Promise<{
      data: ApiResponse<{ id: string; email: string }>;
    }>,
  changePassword: (data: ChangePasswordRequest) =>
    API.auth.changePassword(data) as Promise<{
      data: ApiResponse<{ isBeforeCheck: boolean }>;
    }>,

  // Token Management
  refreshToken: (data: RefreshTokenRequest) =>
    API.auth.refreshToken(data) as Promise<{
      data: ApiResponse<LoginResponse>;
    }>,
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
