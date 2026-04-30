import axios from "axios";
import type { AppDispatch } from "../redux/store";
import { logout, setTokens } from "../redux/slices/authSlice";
import { tokenStorage } from "../utils/tokenStorage";
import type {
  LoginRequest,
  RegisterRequest,
  CheckCodeRequest,
  EmailRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  UpdateProfileRequest,
} from "../types/auth";
import type {
  CreatePostRequest,
  GetPostsParams,
  CommentOnPostRequest,
} from "../types/post";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Main axios instance
const fetch = axios.create({
  baseURL: BASE_URL,
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
fetch.interceptors.request.use(
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
fetch.interceptors.response.use(
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
            `${BASE_URL}/api/v1/auth/refresh-token`,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const { access_token, refresh_token } = response.data.data;

          // Lưu token mới
          tokenStorage.setTokens(access_token, refresh_token);
          if (storeDispatch) {
            storeDispatch(setTokens({ accessToken: access_token, refreshToken: refresh_token }));
          }

          // Retry request gốc với token mới
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return fetch(originalRequest);
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
  auth: {
    // Authentication
    login: (data: LoginRequest) => fetch.post("/api/v1/auth/login", data),
    getProfile: () => fetch.get("/api/v1/auth/profile"),

    // Registration & Activation
    register: (data: RegisterRequest) =>
      fetch.post("/api/v1/auth/register", data),
    checkCode: (data: CheckCodeRequest) =>
      fetch.post("/api/v1/auth/check-code", data),
    retryActive: (data: EmailRequest) =>
      fetch.post("/api/v1/auth/retry-active", data),

    // Password Management
    retryPassword: (data: EmailRequest) =>
      fetch.post("/api/v1/auth/retry-password", data),
    changePassword: (data: ChangePasswordRequest) =>
      fetch.post("/api/v1/auth/change-password", data),

    // Token Management
    refreshToken: (data: RefreshTokenRequest) =>
      fetch.post("/api/v1/auth/refresh-token", data),
  },

  user: {

    // Update current user profile
    updateProfile: (data: UpdateProfileRequest) =>
      fetch.put("/api/v1/users/profile", data),

    // Search users for friend suggestions / add friend flow
    searchFriends: (params?: Record<string, unknown>) =>
      fetch.get("/api/v1/users/search-friends", { params }),

    // Public-ish user detail by id
    getUserById: (id: number | string) =>
      fetch.get(`/api/v1/users/${id}`),
  },

  posts: {
    // Create new post
    createPost: (data: CreatePostRequest) => fetch.post("api/v1/posts", data),

    // Get posts list with pagination
    getPosts: (params?: GetPostsParams) => {
      const queryParams = new URLSearchParams();
      if (params?.page)
        queryParams.append("page", params.page.toString());
      if (params?.pageSize)
        queryParams.append("pageSize", params.pageSize.toString());
      if (params?.query) queryParams.append("query", params.query);

      const queryString = queryParams.toString();
      return fetch.get(`api/v1/posts${queryString ? `?${queryString}` : ""}`);
    },

    // Get current user's posts
    getMyPosts: () => fetch.get("api/v1/posts/me"),

    // Get posts by author id
    getPostsByAuthor: (authorId: string) =>
      fetch.get(`api/v1/posts/author/${authorId}`),

    // Like a post
    likePost: (postId: string) => fetch.post(`api/v1/posts/${postId}/like`),

    // Unlike a post
    unlikePost: (postId: string) =>
      fetch.delete(`api/v1/posts/${postId}/like`),

    // Comment on a post
    commentOnPost: (postId: string, data: CommentOnPostRequest) =>
      fetch.post(`api/v1/posts/${postId}/comment`, data),

    // Get absolute image paths by author id
    getAuthorImages: (authorId: number | string) =>
      fetch.get(`/api/v1/posts/author/${authorId}/images`),
  },

  friends: {
    // Send friend request
    sendRequest: (targetUserId: number) =>
      fetch.post("/api/v1/friends/request", { targetUserId }),

    // Accept friend request
    acceptRequest: (targetUserId: number) =>
      fetch.patch("/api/v1/friends/request/accept", { targetUserId }),

    // Reject friend request
    rejectRequest: (targetUserId: number) =>
      fetch.patch("/api/v1/friends/request/reject", { targetUserId }),

    // Cancel sent friend request
    cancelRequest: (targetUserId: number) =>
      fetch.delete("/api/v1/friends/request", { data: { targetUserId } }),

    // Unfriend
    unfriend: (targetUserId: number) =>
      fetch.delete("/api/v1/friends", { data: { targetUserId } }),

    // Get friends list
    getFriendsList: (params?: Record<string, unknown>) =>
      fetch.get("/api/v1/friends", { params }),

    // Get pending friend requests
    getPendingRequests: (params?: Record<string, unknown>) =>
      fetch.get("/api/v1/friends/pending", { params }),

    // Get another user's friends
    getUserFriends: (userId: number, params?: Record<string, unknown>) =>
      fetch.get(`/api/v1/friends/users/${userId}`, { params }),
  },

  chat: {
    // Get user's conversations
    getConversations: () =>
      fetch.get("/api/v1/conversations"),

    // Create or get existing conversation
    createConversation: (data: { participantIds: number[]; conversationType: string; name?: string; avatarUrl?: string }) =>
      fetch.post("/api/v1/conversations", data),

    // Get messages with cursor pagination
    getMessages: (conversationId: number, params?: { limit?: number; cursor?: number }) =>
      fetch.get(`/api/v1/messages/conversation/${conversationId}`, { params }),
  },

  admin: {
    // Add admin endpoints here
  },

  public: {
    // Add public endpoints here
  },

  other: {
    // Add other endpoints here
  },
};

// Export for backward compatibility
export const publicAPI = fetch;
export const privateAPI = fetch;
export const API_BASE_URL = BASE_URL;

export default fetch;