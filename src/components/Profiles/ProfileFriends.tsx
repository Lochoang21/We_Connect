import { UserCheck, Search, Loader2, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useUserFriends } from "@/hooks/useFriendsQuery"

export interface FriendUser {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  image?: string | null
  isActive?: boolean
  createdAt?: string
  mutualFriends?: number
  isFriend?: boolean
}

interface ProfileFriendsProps {
  userId: number
  isOwn?: boolean
}

function formatJoinDate(dateStr?: string) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function ProfileFriends({ userId, isOwn = false }: ProfileFriendsProps) {
  const [search, setSearch] = useState("")

  const { data, isLoading, isError } = useUserFriends(userId, {
    query: search,
    current: 1,
    pageSize: 100,
  })

  const friends: FriendUser[] = data?.result ?? []

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base">Bạn bè</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{data?.total ?? 0} người bạn</p>
        </div>
        {isOwn && (
          <Button variant="ghost" size="sm" className="text-primary text-sm font-medium">
            Tìm thêm bạn bè
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm bạn bè…"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-muted/60 border border-border/50 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </div>

      {/* States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium italic">Đang tải danh sách bạn bè...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-10">
          <p className="text-sm text-destructive">Đã có lỗi xảy ra khi tải danh sách bạn bè.</p>
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">Chưa có bạn bè nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:border-border hover:bg-muted/30 transition-all cursor-pointer group"
            >
              {/* Avatar + status dot */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-14 h-14 ring-2 ring-border group-hover:ring-primary/30 transition-all">
                  <AvatarImage src={friend.image || "/placeholder.svg"} className="object-cover" />
                  <AvatarFallback className="text-lg font-semibold bg-muted">
                    {friend.name[0]}
                  </AvatarFallback>
                </Avatar>
                {typeof friend.isActive === "boolean" && (
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-card ${
                      friend.isActive ? "bg-emerald-500" : "bg-amber-400"
                    }`}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold truncate">{friend.name}</p>
                  {typeof friend.isActive === "boolean" && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        friend.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}
                    >
                      {friend.isActive ? "Đang hoạt động" : "Chưa kích hoạt"}
                    </span>
                  )}
                </div>

                <div className="mt-1.5 space-y-1">
                  {friend.email && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="text-[11px] truncate">{friend.email}</span>
                    </div>
                  )}
                  {friend.phone ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="text-[11px]">{friend.phone}</span>
                    </div>
                  ) : null}
                  {friend.address ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="text-[11px] truncate">{friend.address}</span>
                    </div>
                  ) : null}
                  {friend.createdAt && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="text-[11px]">Tham gia: {formatJoinDate(friend.createdAt)}</span>
                    </div>
                  )}
                  {typeof friend.mutualFriends === "number" && friend.mutualFriends > 0 && (
                    <p className="text-[11px] text-muted-foreground">{friend.mutualFriends} bạn chung</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}