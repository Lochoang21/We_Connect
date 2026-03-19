import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { friendAPI } from '../services/friendService';
import type { FriendQueryParams } from '../types/friend.types';

// ─── Query Keys — tập trung để invalidate dễ dàng ────────────────────────────
export const friendQueryKeys = {
  all: ['friends'] as const,
  list: (params: FriendQueryParams) => ['friends', 'list', params] as const,
  pending: (params: FriendQueryParams) => ['friends', 'pending', params] as const,
  userFriends: (userId: number, params: FriendQueryParams) =>
    ['friends', 'user', userId, params] as const,
  searchUsers: (params: FriendQueryParams) => ['friends', 'search-users', params] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Danh sách bạn bè của bản thân.
 */
export const useFriendsList = (params: FriendQueryParams = {}) =>
  useQuery({
    queryKey: friendQueryKeys.list(params),
    queryFn: async () => {
      const response = await friendAPI.getFriendsList(params);
      return response.data.data;
    },
    placeholderData: keepPreviousData,   // Giữ data cũ khi đổi trang, tránh flash
    staleTime: 30_000,
  });

/**
 * Danh sách lời mời đang chờ.
 */
export const usePendingRequests = (params: FriendQueryParams = {}) =>
  useQuery({
    queryKey: friendQueryKeys.pending(params),
    queryFn: async () => {
      const response = await friendAPI.getPendingRequests(params);
      return response.data.data;
    },
    staleTime: 10_000,
  });

/**
 * Danh sách bạn bè của user khác.
 */
export const useUserFriends = (userId: number, params: FriendQueryParams = {}) =>
  useQuery({
    queryKey: friendQueryKeys.userFriends(userId, params),
    queryFn: async () => {
      const response = await friendAPI.getUserFriends(userId, params);
      return response.data.data;
    },
    enabled: !!userId,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

/**
 * Tìm user để kết bạn.
 */
export const useSearchFriendsUsers = (params: FriendQueryParams = {}) =>
  useQuery({
    queryKey: friendQueryKeys.searchUsers(params),
    queryFn: async () => {
      const response = await friendAPI.searchFriends(params);
      return response.data.data;
    },
    enabled: !!params.query?.trim(),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Gửi lời mời kết bạn.
 * Sau khi thành công: invalidate pending list phía người nhận
 * (phía sender không cần vì chưa có list "sent requests").
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: number) => friendAPI.sendRequest(targetUserId),
    onSuccess: () => {
      // Invalidate để refetch danh sách bạn bè và pending
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
    },
  });
};

/**
 * Chấp nhận lời mời.
 * Sau khi thành công: friends list thêm người mới, pending list bớt đi 1.
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: number) => friendAPI.acceptRequest(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
    },
  });
};

/**
 * Hủy lời mời đã gửi.
 */
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: number) => friendAPI.cancelRequest(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
    },
  });
};

/**
 * Hủy kết bạn.
 */
export const useUnfriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: number) => friendAPI.unfriend(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
    },
  });
};