import { useState, useCallback, useEffect, useRef } from "react";
import { MessagesPanel } from "@/components/HomePage/MessagesPanel";
import { ChatHeader, type ChatContact } from "@/components/Messages/ChatHeader";
import { ChatMessages } from "@/components/Messages/ChatMessages";
import { ChatInput } from "@/components/Messages/ChatInput";
import { type Message, type MessageStatus } from "@/components/Messages/MessageBubble";
import { MessageSquare } from "lucide-react";
import type { CurrentUserFriend } from "@/types/friend.types";
import type { ChatMessageEntity, UserTypingEvent, MessageSeenEvent } from "@/types/chat.types";
import { chatService } from "@/services/chatService";
import { useChatSocket } from "@/hooks/useChatSocket";
import { tokenStorage } from "@/utils/tokenStorage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toUIMessage(msg: ChatMessageEntity, currentUserId: number): Message {
  // MySQL bigint → TypeORM trả về string, cần Number() để so sánh đúng
  const isOwn = Number(msg.senderId) === currentUserId;
  return {
    id: msg.id.toString(),
    content: msg.content ?? "",
    senderId: msg.senderId.toString(),
    timestamp: new Date(msg.createdAt),
    isOwn,
    status: isOwn ? ("delivered" as MessageStatus) : undefined,
  };
}

function dedup(messages: Message[]): Message[] {
  const map = new Map<string, Message>();
  for (const m of messages) map.set(m.id, m);
  return Array.from(map.values());
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const currentUserId = tokenStorage.getUserIdFromAccessToken() ?? 0;

  // ── State ─────────────────────────────────────────────────────────────────
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Socket ────────────────────────────────────────────────────────────────
  const { sendMessage, emitTyping, emitSeen } = useChatSocket({
    conversationId,

    onNewMessage: useCallback(
      (msg: ChatMessageEntity) => {
        // Khi nhận tin nhắn mới mà chưa có conversationId (lần chat đầu tiên)
        // → cập nhật conversationId từ message
        setConversationId((prev) => prev ?? Number(msg.conversationId));

        const uiMsg = toUIMessage(msg, currentUserId);
        setMessages((prev) => dedup([...prev, uiMsg]));
      },
      [currentUserId]
    ),

    onUserTyping: useCallback(
      (evt: UserTypingEvent) => {
        if (Number(evt.userId) === currentUserId) return;
        if (evt.isTyping) {
          setTypingUser(selectedContact?.name ?? "Đang nhập");
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
        } else {
          setTypingUser(null);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
      },
      [currentUserId, selectedContact]
    ),

    onMessageSeen: useCallback(
      (evt: MessageSeenEvent) => {
        if (Number(evt.userId) === currentUserId) return;
        setMessages((prev) =>
          prev.map((m) => {
            if (m.isOwn && Number(m.id) <= Number(evt.messageId) && m.status !== "read") {
              return { ...m, status: "read" as MessageStatus };
            }
            return m;
          })
        );
      },
      [currentUserId]
    ),
  });

  // ── Chọn bạn bè để chat ──────────────────────────────────────────────────
  const handleSelectConversation = useCallback(
    async (user: CurrentUserFriend) => {
      const friendId = Number(user.id);
      setSelectedFriendId(friendId);

      // 1. Cập nhật header ngay
      setSelectedContact({
        id: user.id.toString(),
        name: user.name,
        avatar: user.image ?? undefined,
        isOnline: true,
      });

      // 2. Reset state
      setMessages([]);
      setConversationId(null);
      setNextCursor(null);
      setTypingUser(null);
      setIsLoadingMessages(true);

      try {
        // 3. Dùng GET /messages/with/:userId để lấy lịch sử + conversationId
        const result = await chatService.getMessagesWithUser(friendId, { limit: 20 });

        // conversationId có thể null (chưa từng chat)
        setConversationId(result.conversationId);

        // 4. Render messages (backend trả newest-first → reverse)
        const uiMessages = result.items
          .map((m) => toUIMessage(m, currentUserId))
          .reverse();

        setMessages(uiMessages);
        setNextCursor(result.nextCursor);

        // 5. Join room nếu có conversation
        // (useChatSocket tự join khi conversationId thay đổi)
      } catch (err) {
        console.error("[MessagesPage] Failed to load chat:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [currentUserId]
  );

  // ── Gửi tin nhắn ─────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (content: string) => {
      // Nếu chưa có conversation (chat lần đầu) → tạo mới trước
      if (conversationId === null && selectedFriendId !== null) {
        try {
          const conv = await chatService.createConversation({
            participantIds: [selectedFriendId],
            conversationType: "one_to_one",
          });
          setConversationId(conv.id);

          // Đợi 1 tick để socket join room trước khi gửi
          setTimeout(() => {
            sendMessage(content);
          }, 100);
          return;
        } catch (err) {
          console.error("[MessagesPage] Failed to create conversation:", err);
          return;
        }
      }

      sendMessage(content);
    },
    [conversationId, selectedFriendId, sendMessage]
  );

  // ── Load more (scroll lên) ────────────────────────────────────────────────
  const handleLoadMore = useCallback(async () => {
    if (nextCursor === null || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      let result;

      if (conversationId) {
        // Có conversationId → dùng endpoint conversation
        result = await chatService.getMessages(conversationId, {
          limit: 20,
          cursor: nextCursor,
        });
      } else if (selectedFriendId) {
        // Chưa có conversationId → dùng endpoint with/:userId
        const withResult = await chatService.getMessagesWithUser(selectedFriendId, {
          limit: 20,
          cursor: nextCursor,
        });
        result = { items: withResult.items, nextCursor: withResult.nextCursor };
      } else {
        return;
      }

      const olderMessages = result.items
        .map((m) => toUIMessage(m, currentUserId))
        .reverse();

      setMessages((prev) => dedup([...olderMessages, ...prev]));
      setNextCursor(result.nextCursor);
    } catch (err) {
      console.error("[MessagesPage] Failed to load more:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, selectedFriendId, nextCursor, isLoadingMore, currentUserId]);

  // ── Typing ────────────────────────────────────────────────────────────────
  const handleTyping = useCallback(
    (isTyping: boolean) => {
      emitTyping(isTyping);
    },
    [emitTyping]
  );

  // ── Auto seen ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg.isOwn) {
      emitSeen(Number(lastMsg.id));
    }
  }, [messages, conversationId, emitSeen]);

  // ── Render ────────────────────────────────────────────────────────────────
  const hasActiveChat = selectedContact !== null;

  return (
    <div className="flex h-[calc(100vh-64px)] max-h-screen bg-background overflow-hidden w-full">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div className="w-[340px] xl:w-[380px] border-r border-border bg-card/30 flex flex-col h-full overflow-hidden shrink-0">
        <div className="p-4 h-full overflow-hidden flex flex-col">
          <MessagesPanel
            onSelectChat={handleSelectConversation}
            selectedChatId={selectedContact?.id}
          />
        </div>
      </div>

      {/* ── Main Chat Area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full bg-background relative min-w-0">
        {hasActiveChat ? (
          <>
            <ChatHeader contact={selectedContact} />

            <ChatMessages
              messages={messages}
              currentUserId={currentUserId.toString()}
              isLoading={isLoadingMessages}
              isLoadingMore={isLoadingMore}
              hasMore={nextCursor !== null}
              onLoadMore={handleLoadMore}
              typingUserName={typingUser}
              contactName={selectedContact.name}
              contactAvatar={selectedContact.avatar}
              className="flex-1"
            />

            <ChatInput onSend={handleSend} onTyping={handleTyping} />
          </>
        ) : (
          <NoConversationState />
        )}
      </div>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function NoConversationState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-10 select-none bg-muted/5">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-primary/8 border border-primary/15 flex items-center justify-center text-primary/50 shadow-inner">
          <MessageSquare size={40} strokeWidth={1.25} />
        </div>
        <span className="absolute -top-2 -right-2 text-xl animate-bounce" style={{ animationDuration: "2s" }}>
          💬
        </span>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">Tin nhắn của bạn</h3>
      <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed mb-6">
        Chọn một cuộc trò chuyện từ danh sách bên trái hoặc tìm kiếm người bạn muốn nhắn tin.
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground/60 bg-muted/40 px-4 py-2 rounded-full border border-border/40">
        <span>⌘</span><span>K</span>
        <span className="ml-1">để tìm kiếm nhanh</span>
      </div>
    </div>
  );
}