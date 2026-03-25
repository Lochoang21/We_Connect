/* eslint-disable @typescript-eslint/no-explicit-any */
// src/redux/slices/authSlice.ts

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import type { AuthState, LoginRequest, User } from "../../types/auth";
import { tokenStorage } from "../../utils/tokenStorage";

interface LoginSuccessPayload {
  access_token: string;
  refresh_token: string;
}

// Initial state
const hasPersistedTokens = tokenStorage.hasTokens();

const initialState: AuthState = {
  user: null,
  accessToken: tokenStorage.getAccessToken(),
  refreshToken: tokenStorage.getRefreshToken(),
  isAuthenticated: hasPersistedTokens,
  isInitialized: false,
  status: 'idle',
  error: null,
  errorCode: null,
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    if (!tokenStorage.hasTokens()) {
      return null as User | null;
    }

    try {
      const response = await authService.getProfile();
      return response.data as User;
    } catch (error: any) {
      tokenStorage.clearAuth();
      return rejectWithValue(error?.response?.data?.message || "Failed to initialize auth");
    }
  }
);

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      const loginData = response.data;
      return {
        access_token: loginData.access_token,
        refresh_token: loginData.refresh_token,
      } as LoginSuccessPayload;
    } catch (error: any) {
      tokenStorage.clearAuth();
      const errorData = error?.response?.data || {};
      const msg = errorData.message || errorData.error || 'Login failed';

      // Map backend error to a numeric code
      let code = errorData.code;

      // Nếu backend không trả code, tự gán dựa trên message
      if (typeof code !== 'number') {
        if (msg?.includes('Tài khoản chưa được kích hoạt') || msg?.includes('not activated')) {
          code = 2; // inactive account
        } else {
          code = 0; // other errors
        }
      }

      return rejectWithValue({ message: msg, code });
    }
  }
);

export const loginAndFetchProfile = createAsyncThunk(
  "auth/loginAndFetchProfile",
  async (credentials: LoginRequest, { dispatch, rejectWithValue }) => {
    const loginResult = await dispatch(login(credentials));
    if (login.rejected.match(loginResult)) {
      return rejectWithValue(loginResult.payload ?? "Login failed");
    }

    const profileResult = await dispatch(fetchUserProfile());
    if (fetchUserProfile.rejected.match(profileResult)) {
      return rejectWithValue(profileResult.payload ?? "Failed to fetch profile");
    }

    return profileResult.payload as User;
  }
);

export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user?: User | null;
        accessToken?: string | null;
        refreshToken?: string | null;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload || {};
      state.user = user ?? null;
      state.accessToken = accessToken ?? null;
      state.refreshToken = refreshToken ?? null;
      state.isAuthenticated = !!accessToken;
      state.isInitialized = true;

      if (accessToken) {
        tokenStorage.setAccessToken(accessToken);
      }
      if (refreshToken) {
        tokenStorage.setRefreshToken(refreshToken);
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.status = 'idle';
      state.error = null;
      state.errorCode = null;
      tokenStorage.clearAuth();
    },
    clearError: (state) => {
      state.error = null;
      state.errorCode = null;
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
      state.isInitialized = true;
      tokenStorage.setAccessToken(action.payload.accessToken);
      if (action.payload.refreshToken) {
        tokenStorage.setRefreshToken(action.payload.refreshToken);
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.errorCode = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.accessToken = tokenStorage.getAccessToken();
        state.refreshToken = tokenStorage.getRefreshToken();
        state.isAuthenticated = tokenStorage.hasTokens();
        state.isInitialized = true;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = (action.payload as string) || 'Failed to initialize auth';
        state.errorCode = null;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.errorCode = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<LoginSuccessPayload>) => {
          state.status = 'succeeded';
          state.user = null;
          state.accessToken = action.payload.access_token;
          state.refreshToken = action.payload.refresh_token;
          state.isAuthenticated = true;
          state.isInitialized = true;
          state.error = null;
          state.errorCode = null;

          // Lưu vào localStorage với prefix
          tokenStorage.setTokens(action.payload.access_token, action.payload.refresh_token);
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.isInitialized = true;

        if (typeof action.payload === 'string' || action.payload == null) {
          state.error = action.payload || 'Login failed';
          state.errorCode = null;
        } else {
          const payload = action.payload as { message: string; code: number };
          state.error = payload.message || 'Login failed';
          state.errorCode = typeof payload.code === 'number' ? payload.code : null;
        }
      })
      .addCase(loginAndFetchProfile.rejected, (state, action) => {
        if (typeof action.payload === 'string' || action.payload == null) {
          state.error = action.payload || state.error || 'Login failed';
          return;
        }

        const payload = action.payload as { message?: string; code?: number };
        if (payload.message) {
          state.error = payload.message;
        }
        if (typeof payload.code === 'number') {
          state.errorCode = payload.code;
        }
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = null;
        state.errorCode = null;
        tokenStorage.clearAuth();
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.status = 'idle';
        // Vẫn logout dù API fail
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = null;
        state.errorCode = null;
        tokenStorage.clearAuth();
      })

    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.status = 'failed';
        // Token không hợp lệ, clear everything
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        tokenStorage.clearAuth();
      });
  },
});

export const { setCredentials, logout, clearError, setTokens } = authSlice.actions;
export default authSlice.reducer;