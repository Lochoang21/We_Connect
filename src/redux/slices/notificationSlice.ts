// src/redux/slices/notificationSlice.ts

import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { notificationService } from '@/services/notificationService'
import type { Notification } from '@/types/notification.types'
import type { RootState } from '@/redux/store'

interface NotificationState {
  items: Notification[]
  total: number
  totalPage: number
  current: number
  pageSize: number
  loading: boolean
  hasMore: boolean
}

const initialState: NotificationState = {
  items: [],
  total: 0,
  totalPage: 1,
  current: 1,
  pageSize: 10,
  loading: false,
  hasMore: true,
}

// ── Thunks ─────────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async ({ current, pageSize }: { current: number; pageSize: number }) => {
    return notificationService.getNotifications(current, pageSize)
  },
)

export const markOneAsRead = createAsyncThunk(
  'notifications/markOne',
  async (id: number) => {
    return notificationService.markAsRead(id)
  },
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAll',
  async () => {
    return notificationService.markAllAsRead()
  },
)

// ── Slice ──────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Nhận thông báo real-time từ socket → prepend lên đầu list
    receiveRealtime(state, action: PayloadAction<Notification>) {
      const exists = state.items.some(n => n.id === action.payload.id)
      if (!exists) {
        state.items.unshift(action.payload)
        state.total += 1
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { result, total, totalPage, current, pageSize } = action.payload
        // Load more: append; trang đầu: replace
        state.items = current === 1 ? result : [...state.items, ...result]
        state.total = total
        state.totalPage = totalPage
        state.current = current
        state.pageSize = pageSize
        state.hasMore = current < totalPage
        state.loading = false
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false
      })

      // markOneAsRead
      .addCase(markOneAsRead.fulfilled, (state, action) => {
        const idx = state.items.findIndex(n => n.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })

      // markAllAsRead — cập nhật toàn bộ items
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items = state.items.map(n => ({ ...n, isRead: 1 }))
      })
  },
})

export const { receiveRealtime } = notificationSlice.actions
export default notificationSlice.reducer

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectNotifications   = (s: RootState) => s.notifications.items
export const selectUnreadCount     = (s: RootState) => s.notifications.items.filter(n => n.isRead === 0).length
export const selectNotifLoading    = (s: RootState) => s.notifications.loading
export const selectNotifHasMore    = (s: RootState) => s.notifications.hasMore
export const selectNotifCurrentPage = (s: RootState) => s.notifications.current