// ─── Enums ────────────────────────────────────────────────────────────────────

export interface FriendStatus {
  PENDING: 'pending';
  ACCEPTED: 'accepted';
  CANCELLED: 'cancelled';
  UNFRIENDED: 'unfriended';
}
// ─── Base Models ──────────────────────────────────────────────────────────────

export interface FriendUserInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRecord {
  id: number;
  userId1: number;
  userId2: number;
  status: FriendStatus;
  actionUserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PendingRequestItem extends FriendRecord {
  sender: FriendUserInfo;
}

// ─── API Request Params ───────────────────────────────────────────────────────

export interface FriendQueryParams {
  query?: string;
  current?: number;
  pageSize?: number;
}

export interface CurrentUserFriend {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface PaginatedFriends {
  result: FriendUserInfo[];
  total: number;
  totalPage: number;
  current: number;
  pageSize: number;
}

export interface CurrentUserFriendsResponse {
  result: CurrentUserFriend[];
  total: number;
  totalPage: number;
  current: number;
  pageSize: number;
}

export interface PendingFriendsResponse {
  result: PendingRequestItem[];
  total: number;
  totalPage: number;
}

export interface FriendshipSummary {
  id: number | null;
  status: "pending" | "accepted" | "cancelled" | "unfriended" | null;
  actionUserId: number | null;
  updatedAt: string | null;
  canSendRequest: boolean;
}

export interface SearchFriendUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bio: string | null;
  friendship: FriendshipSummary;
}

export interface SearchFriendsResponse {
  result: SearchFriendUser[];
  total: number;
  totalPage: number;
  current: number;
  pageSize: number;
}

// ─── WebSocket Event Payloads ─────────────────────────────────────────────────

export interface FriendRequestReceivedEvent {
  friendId: number;
  fromUserId: number;
  toUserId: number;
  status: FriendStatus;
  createdAt: string;
}

export interface FriendRequestAcceptedEvent {
  friendId: number;
  userId1: number;
  userId2: number;
  status: FriendStatus;
  updatedAt: string;
}

export interface FriendRequestCancelledEvent {
  friendId: number;
  fromUserId: number;
  toUserId: number;
  status: FriendStatus;
  updatedAt: string;
}

export interface UnfriendedEvent {
  friendId: number;
  fromUserId: number;
  toUserId: number;
  status: FriendStatus;
  updatedAt: string;
}

export type FriendSocketEvent =
  | { type: 'friend:request:received'; payload: FriendRequestReceivedEvent }
  | { type: 'friend:request:accepted'; payload: FriendRequestAcceptedEvent }
  | { type: 'friend:request:cancelled'; payload: FriendRequestCancelledEvent }
  | { type: 'friend:unfriended'; payload: UnfriendedEvent };