// ─── Conversation ─────────────────────────────────────────────────────────────

export type ConversationType = "one_to_one" | "group";

export interface Conversation {
  id: number;
  conversationType: ConversationType;
  name: string | null;
  avatarUrl: string | null;
  createdById: number | null;
  lastMessageId: number | null;
  lastMessage: ChatMessageEntity | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  participantIds: number[];
  conversationType?: ConversationType;
  name?: string;
  avatarUrl?: string;
}

// ─── Message ──────────────────────────────────────────────────────────────────

export type MessageType =
  | "text"
  | "image"
  | "video"
  | "file"
  | "audio"
  | "sticker"
  | "link";

export interface ChatMessageEntity {
  id: number;
  conversationId: number;
  senderId: number;
  messageType: MessageType;
  content: string | null;
  replyToMessageId: number | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /messages/conversation/:id */
export interface CursorPaginatedMessages {
  items: ChatMessageEntity[];
  nextCursor: number | null;
}

/** GET /messages/with/:userId — lịch sử chat giữa 2 user */
export interface ChatWithUserResponse {
  conversationId: number | null;
  items: ChatMessageEntity[];
  nextCursor: number | null;
}

export interface GetMessagesParams {
  limit?: number;
  cursor?: number;
}

// ─── Socket DTOs ──────────────────────────────────────────────────────────────

/** emit: send_message */
export interface SendMessagePayload {
  conversationId: number;
  messageType: MessageType;
  content: string;
  replyToMessageId?: number | null;
}

/** listen: new_message */
export interface NewMessageEvent {
  message: ChatMessageEntity;
}

/** emit: typing */
export interface TypingPayload {
  conversationId: number;
  isTyping: boolean;
}

/** listen: user_typing */
export interface UserTypingEvent {
  conversationId: number;
  userId: number;
  isTyping: boolean;
}

/** emit: seen_message */
export interface SeenMessagePayload {
  conversationId: number;
  messageId?: number;
}

/** listen: message_seen */
export interface MessageSeenEvent {
  conversationId: number;
  userId: number;
  messageId: number;
  seenAt: string;
}
