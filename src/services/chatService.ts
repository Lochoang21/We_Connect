import fetch from "./apiService";
import type {
  Conversation,
  CreateConversationRequest,
  CursorPaginatedMessages,
  ChatWithUserResponse,
  GetMessagesParams,
} from "@/types/chat.types";

export const chatService = {
  // ── Conversations ─────────────────────────────────────────────────────────

  /** GET /api/v1/conversations */
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch.get("/api/v1/conversations");
    return res.data?.data ?? res.data ?? [];
  },

  /** POST /api/v1/conversations */
  async createConversation(body: CreateConversationRequest): Promise<Conversation> {
    const res = await fetch.post("/api/v1/conversations", body);
    return res.data?.data ?? res.data;
  },

  // ── Messages ──────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/messages/conversation/:id?limit=N&cursor=X
   * Lấy tin nhắn theo conversationId (cursor pagination).
   */
  async getMessages(
    conversationId: number,
    params?: GetMessagesParams
  ): Promise<CursorPaginatedMessages> {
    const res = await fetch.get(
      `/api/v1/messages/conversation/${conversationId}`,
      { params }
    );
    const data = res.data?.data ?? res.data;
    return {
      items: data?.items ?? data ?? [],
      nextCursor: data?.nextCursor ?? null,
    };
  },

  /**
   * GET /api/v1/messages/with/:userId?limit=N&cursor=X
   * Lấy lịch sử chat giữa current user và userId.
   * Trả về conversationId (hoặc null nếu chưa có conversation).
   */
  async getMessagesWithUser(
    userId: number,
    params?: GetMessagesParams
  ): Promise<ChatWithUserResponse> {
    const res = await fetch.get(
      `/api/v1/messages/with/${userId}`,
      { params }
    );
    const data = res.data?.data ?? res.data;
    return {
      conversationId: data?.conversationId ?? null,
      items: data?.items ?? [],
      nextCursor: data?.nextCursor ?? null,
    };
  },
};
