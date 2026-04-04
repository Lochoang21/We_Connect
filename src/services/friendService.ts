// src/services/friendService.ts

import { API } from "./apiService";
import type {
  CurrentUserFriendsResponse,
  FriendRecord,
  FriendQueryParams,
  PaginatedFriends,
  PendingFriendsResponse,
  SearchFriendsResponse,
} from "../types/friend.types";
import type { ApiResponse } from "../types/auth";

const toNumericId = (id: number | string): number => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    throw new Error("Id người dùng phải là số");
  }
  return numericId;
};

// Friend API endpoints - sử dụng API từ apiService
export const friendAPI = {
  // Send friend request
  sendRequest: (targetUserId: number | string) =>
    API.friends.sendRequest(toNumericId(targetUserId)) as Promise<{
      data: ApiResponse<FriendRecord>;
    }>,

  // Accept friend request
  acceptRequest: (targetUserId: number | string) =>
    API.friends.acceptRequest(toNumericId(targetUserId)) as Promise<{
      data: ApiResponse<FriendRecord>;
    }>,

  // Reject friend request
  rejectRequest: (targetUserId: number | string) =>
    API.friends.rejectRequest(toNumericId(targetUserId)) as Promise<{
      data: ApiResponse<FriendRecord>;
    }>,

  // Cancel sent friend request
  cancelRequest: (targetUserId: number | string) =>
    API.friends.cancelRequest(toNumericId(targetUserId)) as Promise<{
      data: ApiResponse<FriendRecord>;
    }>,

  // Unfriend
  unfriend: (targetUserId: number | string) =>
    API.friends.unfriend(toNumericId(targetUserId)) as Promise<{
      data: ApiResponse<FriendRecord>;
    }>,

  // Get friends list
  getFriendsList: (params?: FriendQueryParams) =>
    API.friends.getFriendsList(params as Record<string, unknown>) as Promise<{
      data: ApiResponse<PaginatedFriends>;
    }>,

  // Get current user's friends list (GET /api/v1/friends)
  getCurrentUserFriends: (params?: FriendQueryParams) =>
    API.friends.getFriendsList(params as Record<string, unknown>) as Promise<{
      data: ApiResponse<CurrentUserFriendsResponse>;
    }>,

  // Get pending friend requests
  getPendingRequests: (params?: FriendQueryParams) =>
    API.friends.getPendingRequests(params as Record<string, unknown>) as Promise<{
      data: ApiResponse<PendingFriendsResponse>;
    }>,

  // Get another user's friends
  getUserFriends: (userId: number | string, params?: FriendQueryParams) =>
    API.friends.getUserFriends(toNumericId(userId), params as Record<string, unknown>) as Promise<{
      data: ApiResponse<PaginatedFriends>;
    }>,

  // Search users to add friends
  searchFriends: (params?: FriendQueryParams) =>
    API.user.searchFriends(params as Record<string, unknown>) as Promise<{
      data: ApiResponse<SearchFriendsResponse>;
    }>,
};

// Helper function for type-safe error handling
function getErrorMessage(
  error: unknown,
  fallback = "Lỗi không xác định"
): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  // Check if it's an axios error with response.data.message
  const axiosError = error as { response?: { data?: { message?: string } } };
  return axiosError.response?.data?.message ?? fallback;
}

// Friend service - Wrapper methods with error handling
export const friendService = {
  /**
   * Gửi lời mời kết bạn
   * @param targetUserId - ID của người muốn kết bạn
   * @returns Friend record sau khi gửi lời mời
   */
  sendRequest: async (targetUserId: number | string): Promise<FriendRecord> => {
    try {
      const response = await friendAPI.sendRequest(targetUserId);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Send friend request error:", error);
      throw new Error(
        getErrorMessage(error, "Failed to send friend request")
      );
    }
  },

  /**
   * Chấp nhận lời mời kết bạn
   * @param targetUserId - ID của người gửi lời mời
   * @returns Friend record sau khi chấp nhận
   */
  acceptRequest: async (targetUserId: number | string): Promise<FriendRecord> => {
    try {
      const response = await friendAPI.acceptRequest(targetUserId);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Accept friend request error:", error);
      throw new Error(
        getErrorMessage(error, "Failed to accept friend request")
      );
    }
  },

  /**
   * Từ chối lời mời kết bạn
   * @param targetUserId - ID của người gửi lời mời
   * @returns Friend record sau khi từ chối
   */
  rejectRequest: async (targetUserId: number | string): Promise<FriendRecord> => {
    try {
      const response = await friendAPI.rejectRequest(targetUserId);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Reject friend request error:", error);
      throw new Error(
        getErrorMessage(error, "Failed to reject friend request")
      );
    }
  },

  /**
   * Hủy lời mời kết bạn đã gửi
   * @param targetUserId - ID của người đã gửi lời mời tới
   * @returns Friend record sau khi hủy
   */
  cancelRequest: async (targetUserId: number | string): Promise<FriendRecord> => {
    try {
      const response = await friendAPI.cancelRequest(targetUserId);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Cancel friend request error:", error);
      throw new Error(
        getErrorMessage(error, "Failed to cancel friend request")
      );
    }
  },

  /**
   * Hủy kết bạn
   * @param targetUserId - ID của bạn bè muốn hủy
   * @returns Friend record sau khi hủy
   */
  unfriend: async (targetUserId: number | string): Promise<FriendRecord> => {
    try {
      const response = await friendAPI.unfriend(targetUserId);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Unfriend error:", error);
      throw new Error(getErrorMessage(error, "Failed to unfriend"));
    }
  },

  /**
   * Lấy danh sách bạn bè của bản thân
   * @param params - Query parameters (query, current, pageSize)
   * @returns Danh sách bạn bè với pagination
   */
  getFriendsList: async (
    params?: FriendQueryParams
  ): Promise<PaginatedFriends> => {
    try {
      const response = await friendAPI.getFriendsList(params);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Get friends list error:", error);
      throw new Error(getErrorMessage(error, "Failed to get friends list"));
    }
  },

  /**
   * Lấy danh sách bạn bè của người dùng hiện tại
   * @param params - Query parameters (query, current, pageSize)
   * @returns Danh sách bạn bè hiện tại với pagination
   */
  getCurrentUserFriends: async (
    params?: FriendQueryParams
  ): Promise<CurrentUserFriendsResponse> => {
    try {
      const response = await friendAPI.getCurrentUserFriends(params);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Get current user friends error:", error);
      throw new Error(getErrorMessage(error, "Failed to get current user friends"));
    }
  },

  /**
   * Lấy danh sách lời mời kết bạn đang chờ
   * @param params - Query parameters (query, current, pageSize)
   * @returns Danh sách lời mời chờ duyệt
   */
  getPendingRequests: async (
    params?: FriendQueryParams
  ): Promise<PendingFriendsResponse> => {
    try {
      const response = await friendAPI.getPendingRequests(params);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Get pending requests error:", error);
      throw new Error(getErrorMessage(error, "Failed to get pending requests"));
    }
  },

  /**
   * Lấy danh sách bạn bè của một user khác
   * @param userId - ID của user
   * @param params - Query parameters (query, current, pageSize)
   * @returns Danh sách bạn bè của user đó
   */
  getUserFriends: async (
    userId: number | string,
    params?: FriendQueryParams
  ): Promise<PaginatedFriends> => {
    try {
      const response = await friendAPI.getUserFriends(userId, params);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Get user friends error:", error);
      throw new Error(getErrorMessage(error, "Failed to get user friends"));
    }
  },

  /**
   * Tìm kiếm user để kết bạn
   * @param params - Query parameters (query, current, pageSize)
   * @returns Danh sách user matching query + trạng thái friendship
   */
  searchFriends: async (
    params?: FriendQueryParams
  ): Promise<SearchFriendsResponse> => {
    try {
      const response = await friendAPI.searchFriends(params);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Search users for friends error:", error);
      throw new Error(getErrorMessage(error, "Failed to search users"));
    }
  },
};

export default friendService;
