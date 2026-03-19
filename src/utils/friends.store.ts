import { create } from 'zustand';
import type { FriendUserInfo } from '../types/friend.types';

interface FriendsStore {
  // ─── State ──────────────────────────────────────────────────────────────────
  pendingCount: number;       // Số lời mời chưa đọc — hiển thị trên badge
  newRequestIds: number[];    // friendId của các request vừa nhận qua WS
  recentlyAccepted: FriendUserInfo | null; // Toast khi được accept

  // ─── Actions ────────────────────────────────────────────────────────────────

  /** Khi WS nhận friend:request:received */
  onRequestReceived: (friendId: number) => void;

  /** Khi WS nhận friend:request:accepted — người kia vừa accept lời mời của mình */
  onRequestAccepted: (user: FriendUserInfo) => void;

  /** Khi WS nhận friend:request:cancelled */
  onRequestCancelled: (friendId: number) => void;

  /** Khi WS nhận friend:unfriended */
  onUnfriended: () => void;

  /** Set pending count từ API (lần đầu load) */
  setPendingCount: (count: number) => void;

  /** Đánh dấu đã đọc — clear badge */
  markRequestsSeen: () => void;

  clearRecentlyAccepted: () => void;
}

export const useFriendsStore = create<FriendsStore>((set) => ({
  pendingCount: 0,
  newRequestIds: [],
  recentlyAccepted: null,

  onRequestReceived: (friendId) =>
    set((s) => ({
      pendingCount: s.pendingCount + 1,
      newRequestIds: [...s.newRequestIds, friendId],
    })),

  onRequestAccepted: (user) =>
    set({ recentlyAccepted: user }),

  onRequestCancelled: (friendId) =>
    set((s) => ({
      pendingCount: Math.max(0, s.pendingCount - 1),
      newRequestIds: s.newRequestIds.filter((id) => id !== friendId),
    })),

  onUnfriended: () => set((s) => s),  // Chỉ trigger re-render, data từ TanStack Query

  setPendingCount: (count) => set({ pendingCount: count }),

  markRequestsSeen: () => set({ newRequestIds: [] }),

  clearRecentlyAccepted: () => set({ recentlyAccepted: null }),
}));