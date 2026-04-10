import { Bell, Heart, MessageCircle, UserPlus, Share2, Info, Check, Settings } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useDispatch, useSelector } from 'react-redux'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

import {
  selectNotifications,
  selectUnreadCount,
  selectNotifHasMore,
  selectNotifCurrentPage,
  selectNotifLoading,
  markOneAsRead,
  markAllAsRead,
  fetchNotifications,
} from '@/redux/slices/notificationSlice'
import type { AppDispatch } from '@/redux/store'

// ── Icon + color maps ──────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string }> = {
  LIKE:    { icon: <Heart    size={9}  fill="white" stroke="none" />, bg: "bg-red-500"    },
  COMMENT: { icon: <MessageCircle size={9} fill="white" stroke="none" />, bg: "bg-blue-500" },
  FOLLOW:  { icon: <UserPlus size={9} className="text-white" />,          bg: "bg-emerald-500" },
  SHARE:   { icon: <Share2   size={9} className="text-white" />,          bg: "bg-pink-500"   },
  SYSTEM:  { icon: <Info     size={9} className="text-white" />,          bg: "bg-slate-400"  },
}

const AVATAR_COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
]

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  const dispatch = useDispatch<AppDispatch>()
  const notifications = useSelector(selectNotifications)
  const unreadCount = useSelector(selectUnreadCount)
  const hasMore = useSelector(selectNotifHasMore)
  const currentPage = useSelector(selectNotifCurrentPage)
  const loading = useSelector(selectNotifLoading)

  // Phân chia theo trạng thái đọc
  const unreadNotifs = notifications.filter(n => n.isRead === 0)
  const readNotifs = notifications.filter(n => n.isRead === 1)

  const handleMarkAll = () => dispatch(markAllAsRead())
  const handleMarkOne = (id: number) => dispatch(markOneAsRead(id))

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight + 10 && !loading && hasMore) {
      dispatch(fetchNotifications({ current: currentPage + 1, pageSize: 10 }))
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const renderNotification = (n: typeof notifications[0], i: number) => {
    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEM
    const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
    return (
      <div
        key={n.id}
        onClick={() => {
          if (n.isRead === 0) handleMarkOne(n.id)
        }}
        className={cn(
          "flex items-start gap-2.5 px-3.5 py-3 cursor-pointer transition-colors",
          n.isRead === 0
            ? "bg-primary/5 hover:bg-primary/10"
            : "hover:bg-muted/50"
        )}
      >
        <div className="relative flex-shrink-0">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "text-[13px] font-semibold overflow-hidden", avatarColor
          )}>
            {n.actor?.image
              ? <img src={n.actor.image} alt={n.actor.name || "Avatar"} className="w-full h-full object-cover" />
              : (n.actor?.name?.charAt(0) || 'U')}
          </div>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full",
            "border-2 border-card flex items-center justify-center", cfg.bg
          )}>
            {cfg.icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-[13px] leading-snug",
            n.isRead === 0 ? "text-foreground font-semibold" : "text-foreground/80"
          )}>
            <span className="font-bold">{n.actor?.name || "Hệ thống"}</span>{" "}
            {n.content}
          </p>
          <p className={cn(
            "text-[11px] mt-1 flex items-center gap-2",
            n.isRead === 0 ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
            {n.isRead === 0 && <span className="w-1 h-1 rounded-full bg-primary" />}
          </p>
        </div>
        {n.isRead === 0 && (
          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        title="Thông báo"
        onClick={() => setOpen(o => !o)}
        className="relative w-[38px] h-[38px] rounded-full flex items-center justify-center
          bg-muted/60 text-foreground/75
          hover:bg-muted hover:text-foreground hover:-translate-y-px
          transition-all duration-150 cursor-pointer border-0"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] rounded-full
            bg-destructive border-2 border-card
            flex items-center justify-center text-[9px] font-semibold text-white px-0.5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[380px]
          bg-card border border-border/60 rounded-2xl shadow-xl shadow-black/10
          overflow-hidden z-50">

          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <h3 className="text-[15px] font-semibold text-foreground">Thông báo</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMarkAll}
                className="p-1.5 rounded-full hover:bg-accent/10 text-primary transition-colors"
                title="Đánh dấu tất cả là đã đọc"
              >
                <Check size={16} />
              </button>
              <button className="p-1.5 rounded-full hover:bg-accent/10 text-muted-foreground">
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto scrollbar-thin" onScroll={handleScroll}>
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-[13.5px] text-muted-foreground">
                Không có thông báo nào
              </div>
            ) : (
              <div className="pb-2">
                {/* Section: Chưa đọc */}
                {unreadNotifs.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card/95 backdrop-blur z-10 border-b border-border/40">
                      Mới
                    </div>
                    <div className="divide-y divide-border/40">
                      {unreadNotifs.map((n, i) => renderNotification(n, i))}
                    </div>
                  </div>
                )}
                
                {/* Section: Đã đọc */}
                {readNotifs.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card/95 backdrop-blur z-10 border-y border-border/40 mt-1">
                      Trước đó
                    </div>
                    <div className="divide-y divide-border/40">
                      {readNotifs.map((n, i) => renderNotification(n, unreadNotifs.length + i))}
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="p-3 text-center text-[12px] text-muted-foreground animate-pulse">
                    Đang tải thêm...
                  </div>
                )}
              </div>
            )
          }
          </div>

          <div className="border-t border-border/50 p-2">
            <button className="w-full text-[13px] text-primary font-medium
                py-2 rounded-xl hover:bg-primary/5 transition-colors">
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}