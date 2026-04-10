// src/hooks/useNotificationSocket.ts

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from '@/sockets/notificationSocket'
import { receiveRealtime } from '@/redux/slices/notificationSlice'
import type { AppDispatch, RootState } from '@/redux/store'
import type { Notification } from '@/types/notification.types'

export function useNotificationSocket() {
  const dispatch = useDispatch<AppDispatch>()
  const token = useSelector((s: RootState) => s.auth.accessToken)  // lấy token từ auth slice

  useEffect(() => {
    if (!token) return

    const socket = connectNotificationSocket(token)

    socket.on('notification:new', (payload: Notification) => {
      dispatch(receiveRealtime(payload))
    })

    return () => {
      socket.off('notification:new')
      disconnectNotificationSocket()
    }
  }, [token, dispatch])
}