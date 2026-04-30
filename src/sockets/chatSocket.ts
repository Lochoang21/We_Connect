/**
 * Chat Socket — kết nối tới namespace /chat
 *
 * Sử dụng singleton pattern giống notificationSocket.ts
 * nhưng dùng getSocket helper từ socket.manager.ts để
 * đảm bảo mỗi namespace chỉ có đúng 1 kết nối.
 */

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectChatSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

  socket = io(`${baseUrl}/chat`, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  // Debug logging (dev only)
  if (import.meta.env.DEV) {
    socket.on("connect", () => console.log("[chat-socket] connected:", socket?.id));
    socket.on("disconnect", (reason) => console.log("[chat-socket] disconnected:", reason));
    socket.on("connect_error", (err) => console.error("[chat-socket] error:", err.message));
  }

  return socket;
};

export const disconnectChatSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getChatSocket = () => socket;

/**
 * Khi reconnect, cần join lại các room đang active.
 * Hàm này được gọi bởi hook khi socket reconnect.
 */
export const rejoinConversation = (conversationId: number) => {
  socket?.emit("join_conversation", { conversationId });
};
