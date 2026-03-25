/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFriendsSocket } from '../../hooks/useFriendsSocket'
import { useFriendsStore } from '../../utils/friends.store';
import { usePendingRequests } from '../../hooks/useFriendsQuery';
import { friendQueryKeys } from '../../hooks/useFriendsQuery';
import type {
  FriendRequestReceivedEvent,
  FriendRequestAcceptedEvent,
  FriendRequestCancelledEvent,
  UnfriendedEvent,
} from '../../types/friend.types';

interface FriendsProviderProps {
  children: ReactNode;
}

/**
 * FriendsProvider là cầu nối giữa WebSocket events và state management.
 *
 * Đặt provider này ở cấp cao (vd: trong MainLayout sau khi đã login)
 * để mọi component con đều nhận được realtime updates.
 *
 * Luồng xử lý khi có WS event:
 *   WS event → useFriendsSocket → FriendsProvider
 *     → (1) Cập nhật Zustand store (badge count, toast)
 *     → (2) Invalidate TanStack Query cache (refetch data mới nhất)
 */
export const FriendsProvider = ({ children }: FriendsProviderProps) => {
  const queryClient = useQueryClient();
  const { onRequestReceived, onRequestAccepted, onRequestCancelled, onUnfriended, setPendingCount } =
    useFriendsStore();

  // Lần đầu load: đồng bộ pending count vào store
  const { data: pendingData } = usePendingRequests({ current: 1, pageSize: 1 });

  useEffect(() => {
    if (pendingData?.total !== undefined) {
      setPendingCount(pendingData.total);
    }
  }, [pendingData?.total, setPendingCount]);

  useFriendsSocket({
    // Có người gửi lời mời đến mình
    onRequestReceived: (payload: FriendRequestReceivedEvent) => {
      onRequestReceived(payload.friendId);
      // Refetch danh sách pending để có đủ thông tin sender
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
    },

    // Người kia vừa accept lời mời của mình
    onRequestAccepted: (payload: FriendRequestAcceptedEvent) => {
      // Không biết thông tin user từ WS payload → invalidate để refetch
      onRequestAccepted({
        id: payload.userId1,   // Tạm thời, sẽ được overwrite khi query refetch
        name: '',
        email: '',
        phone: '',
        address: '',
        image: '',
        isActive: true,
        createdAt: payload.updatedAt,
        updatedAt: payload.updatedAt,
      });
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
    },

    // Người kia hủy lời mời họ đã gửi cho mình
    onRequestCancelled: (payload: FriendRequestCancelledEvent) => {
      onRequestCancelled(payload.friendId);
      // Invalidate all friend-related queries so Search/Profile state updates in real-time.
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
    },

    // Bị người kia unfriend
    onUnfriended: (_payload: UnfriendedEvent) => {
      onUnfriended();
      // Invalidate all friend-related queries so Search/Profile state updates in real-time.
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
    },
  });

  return <>{children}</>;
};