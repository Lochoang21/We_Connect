import axios from "axios";
import type { AppDispatch } from "../redux/store";
import { logout } from "../redux/slices/authSlice";
import { tokenStorage } from "../utils/tokenStorage";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

// Public axios instance (không cần authentication)
export const publicAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Private axios instance (cần authentication)
export const privateAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến lưu dispatch để có thể gọi từ interceptors
let storeDispatch: AppDispatch | null = null;

export const setApiDispatch = (dispatch: AppDispatch) => {
  storeDispatch = dispatch;
};

// Hàm xử lý khi token hết hạn
const handleTokenExpiration = () => {
  tokenStorage.clearTokens();

  // Clear auth state từ Redux
  if (storeDispatch) {
    storeDispatch(logout());
  }

  // Redirect to login
  window.location.href = "/login";
};

// Request interceptor - Tự động thêm token vào header
privateAPI.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý refresh token khi 401
privateAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();

        if (refreshToken) {
          // Gọi API refresh token với body đúng format backend
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh-token`,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const { access_token, refresh_token } = response.data.data;

          // Lưu token mới với prefix
          tokenStorage.setTokens(access_token, refresh_token);

          // Retry request gốc với token mới
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return privateAPI(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        handleTokenExpiration();
        return Promise.reject(refreshError);
      }
    }

    // Nếu 401 nhưng đã retry rồi
    if (error.response?.status === 401) {
      handleTokenExpiration();
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const API = {
  // Thêm các API khác ở đây
  // user: {
  //   getProfile: () => privateAPI.get("/api/v1/user/profile"),
  //   updateProfile: (data: User) =>
  //     privateAPI.put("/api/v1/user/profile", data),
  // },
};

// Default export for convenience (use publicAPI for auth endpoints)
export default publicAPI;