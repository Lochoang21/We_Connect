// src/sockets/notificationSocket.ts

import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectNotificationSocket = (token: string): Socket => {
  if (socket?.connected) return socket

  socket = io(`${import.meta.env.VITE_API_URL}/notifications`, {
    auth: { token },       // backend đọc client.handshake.auth.token
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })

  return socket
}

export const disconnectNotificationSocket = () => {
  socket?.disconnect()
  socket = null
}

export const getNotificationSocket = () => socket