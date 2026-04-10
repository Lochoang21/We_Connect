// src/services/notificationService.ts

import axiosInstance from './apiService'// axios đã cấu hình baseURL + token
import type { NotificationPaginatedResponse, Notification } from '@/types/notification.types'

export const notificationService = {
  getNotifications: async (
    current = 1,
    pageSize = 100, // Lấy nhiều để hiển thị hết như ý user
  ): Promise<NotificationPaginatedResponse> => {
    const response = await axiosInstance.get('/api/v1/notifications', {
      params: { current, pageSize },
    })
    return response.data.data
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await axiosInstance.patch(`/api/v1/notifications/${id}/read`)
    return response.data.data
  },

  markAllAsRead: async (): Promise<{ updated: number }> => {
    const response = await axiosInstance.patch('/api/v1/notifications/read-all')
    return response.data.data
  },
}