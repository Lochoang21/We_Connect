import { io, Socket } from 'socket.io-client';
import { tokenStorage } from '../utils/tokenStorage';

// ─── Singleton map: namespace → Socket instance ───────────────────────────────
const sockets = new Map<string, Socket>();

/**
 * Lấy (hoặc tạo mới) socket cho một namespace cụ thể.
 * Đảm bảo mỗi namespace chỉ có 1 connection duy nhất trong toàn app.
 */
export const getSocket = (namespace: string): Socket => {
  if (sockets.has(namespace)) {
    return sockets.get(namespace)!;
  }

  const token = tokenStorage.getAccessToken();
  const baseUrl = import.meta.env.VITE_WS_BASE_URL ?? 'http://localhost:3000';

  const socket = io(`${baseUrl}/${namespace}`, {
    auth: { token },
    // Tự động reconnect với backoff
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    // Chỉ dùng WebSocket, không fallback về polling
    transports: ['websocket'],
  });

  sockets.set(namespace, socket);
  return socket;
};

/**
 * Ngắt kết nối và xóa socket của một namespace.
 * Gọi khi logout hoặc unmount component cấp cao nhất.
 */
export const disconnectSocket = (namespace: string): void => {
  const socket = sockets.get(namespace);
  if (socket) {
    socket.disconnect();
    sockets.delete(namespace);
  }
};

/**
 * Ngắt kết nối tất cả socket (dùng khi logout).
 */
export const disconnectAllSockets = (): void => {
  sockets.forEach((socket) => socket.disconnect());
  sockets.clear();
};