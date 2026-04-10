// src/types/notification.types.ts

export type NotificationType =
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'SHARE'
  | 'SYSTEM'

export type ReferenceType = 'POST' | 'COMMENT' | 'USER'

export interface NotificationActor {
  id: number
  name: string
  email: string
  image: string | null
}

export interface Notification {
  id: number
  userId: number
  actorId: number
  type: NotificationType
  referenceId: number | null
  referenceType: ReferenceType | null
  content: string | null
  isRead: number           // 0 | 1 — giữ nguyên kiểu từ backend
  createdAt: string
  actor?: NotificationActor
}

export interface NotificationPaginatedResponse {
  result: Notification[]
  total: number
  totalPage: number
  current: number
  pageSize: number
}