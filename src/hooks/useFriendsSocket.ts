import { useEffect, useCallback } from 'react';
import { getSocket } from '../services/socket.manager'
import type {
  FriendRequestReceivedEvent,
  FriendRequestAcceptedEvent,
  FriendRequestCancelledEvent,
  UnfriendedEvent,
} from '../types/friend.types';

interface UseFriendsSocketOptions {
  onRequestReceived?: (payload: FriendRequestReceivedEvent) => void;
  onRequestAccepted?: (payload: FriendRequestAcceptedEvent) => void;
  onRequestCancelled?: (payload: FriendRequestCancelledEvent) => void;
  onUnfriended?: (payload: UnfriendedEvent) => void;
}

/**
 * Hook quản lý toàn bộ WebSocket events của Friends namespace.
 *
 * Cách dùng:
 *   useFriendsSocket({
 *     onRequestReceived: (payload) => { ... },
 *     onRequestAccepted: (payload) => { ... },
 *   });
 *
 * Tự động cleanup listener khi component unmount.
 * Không tạo connection mới nếu đã có — dùng lại singleton từ socket.manager.
 */
export const useFriendsSocket = (options: UseFriendsSocketOptions) => {
  const {
    onRequestReceived,
    onRequestAccepted,
    onRequestCancelled,
    onUnfriended,
  } = options;

  // Wrap callbacks trong useCallback để tránh re-register listener
  // mỗi lần component re-render
  const handleRequestReceived = useCallback(
    (payload: FriendRequestReceivedEvent) => {
      onRequestReceived?.(payload);
    },
    [onRequestReceived],
  );

  const handleRequestAccepted = useCallback(
    (payload: FriendRequestAcceptedEvent) => {
      onRequestAccepted?.(payload);
    },
    [onRequestAccepted],
  );

  const handleRequestCancelled = useCallback(
    (payload: FriendRequestCancelledEvent) => {
      onRequestCancelled?.(payload);
    },
    [onRequestCancelled],
  );

  const handleUnfriended = useCallback(
    (payload: UnfriendedEvent) => {
      onUnfriended?.(payload);
    },
    [onUnfriended],
  );

  useEffect(() => {
    const socket = getSocket('friends');

    socket.on('friend:request:received', handleRequestReceived);
    socket.on('friend:request:accepted', handleRequestAccepted);
    socket.on('friend:request:cancelled', handleRequestCancelled);
    socket.on('friend:unfriended', handleUnfriended);

    // Cleanup: gỡ đúng handler đã đăng ký, không gỡ hết listener của event
    return () => {
      socket.off('friend:request:received', handleRequestReceived);
      socket.off('friend:request:accepted', handleRequestAccepted);
      socket.off('friend:request:cancelled', handleRequestCancelled);
      socket.off('friend:unfriended', handleUnfriended);
    };
  }, [
    handleRequestReceived,
    handleRequestAccepted,
    handleRequestCancelled,
    handleUnfriended,
  ]);
};