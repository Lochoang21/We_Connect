/**
 * useChatSocket – hook quản lý toàn bộ luồng realtime chat.
 *
 * Responsibilities:
 * 1. Kết nối / ngắt socket khi mount/unmount (hoặc khi token thay đổi).
 * 2. Join room khi chọn conversation.
 * 3. Lắng nghe new_message, user_typing, message_seen.
 * 4. Emit send_message, typing, seen_message.
 * 5. Xử lý reconnect → join lại room.
 */

import { useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  connectChatSocket,
  disconnectChatSocket,
  getChatSocket,
} from "@/sockets/chatSocket";
import type {
  SendMessagePayload,
  NewMessageEvent,
  UserTypingEvent,
  MessageSeenEvent,
  ChatMessageEntity,
} from "@/types/chat.types";

export interface UseChatSocketOptions {
  /** ID conversation đang mở — null nếu chưa chọn */
  conversationId: number | null;
  /** Callback khi nhận tin nhắn mới */
  onNewMessage?: (msg: ChatMessageEntity) => void;
  /** Callback khi user khác typing */
  onUserTyping?: (evt: UserTypingEvent) => void;
  /** Callback khi tin nhắn được seen */
  onMessageSeen?: (evt: MessageSeenEvent) => void;
}

export function useChatSocket({
  conversationId,
  onNewMessage,
  onUserTyping,
  onMessageSeen,
}: UseChatSocketOptions) {
  const token = useSelector((s: RootState) => s.auth.accessToken);

  // Dùng ref để callback luôn lấy phiên bản mới nhất
  const callbacksRef = useRef({ onNewMessage, onUserTyping, onMessageSeen });
  callbacksRef.current = { onNewMessage, onUserTyping, onMessageSeen };

  // Ref để track conversationId hiện tại cho reconnect handler
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  // ── 1. Connect / disconnect socket ──────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const socket = connectChatSocket(token);

    // ── Event listeners ──────────────────────────────────────────────────────

    const handleNewMessage = (data: NewMessageEvent) => {
      callbacksRef.current.onNewMessage?.(data.message);
    };

    const handleUserTyping = (data: UserTypingEvent) => {
      callbacksRef.current.onUserTyping?.(data);
    };

    const handleMessageSeen = (data: MessageSeenEvent) => {
      callbacksRef.current.onMessageSeen?.(data);
    };

    // Khi reconnect → join lại room đang mở
    const handleReconnect = () => {
      const id = conversationIdRef.current;
      if (id !== null) {
        socket.emit("join_conversation", { conversationId: id });
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("message_seen", handleMessageSeen);
    socket.io.on("reconnect", handleReconnect);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("message_seen", handleMessageSeen);
      socket.io.off("reconnect", handleReconnect);
      disconnectChatSocket();
    };
  }, [token]);

  // ── 2. Join room khi conversationId thay đổi ──────────────────────────────
  useEffect(() => {
    if (conversationId === null) return;
    const socket = getChatSocket();
    if (!socket?.connected) return;

    socket.emit("join_conversation", { conversationId });
  }, [conversationId]);

  // ── 3. Emit helpers ────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    (content: string, replyToMessageId?: number | null) => {
      if (conversationId === null) return;
      const socket = getChatSocket();
      if (!socket) return;

      const payload: SendMessagePayload = {
        conversationId,
        messageType: "text",
        content,
        replyToMessageId: replyToMessageId ?? null,
      };
      socket.emit("send_message", payload);
    },
    [conversationId]
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (conversationId === null) return;
      const socket = getChatSocket();
      socket?.emit("typing", { conversationId, isTyping });
    },
    [conversationId]
  );

  const emitSeen = useCallback(
    (messageId: number) => {
      if (conversationId === null) return;
      const socket = getChatSocket();
      socket?.emit("seen_message", { conversationId, messageId });
    },
    [conversationId]
  );

  return { sendMessage, emitTyping, emitSeen };
}
