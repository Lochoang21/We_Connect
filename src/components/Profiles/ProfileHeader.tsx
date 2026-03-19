import { Camera, MessageSquare, MoreHorizontal, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { ProfileUser } from "@/components/Profiles/types"
import { ProfileTabs } from "@/components/Profiles/ProfileTabs"

interface ProfileHeaderProps {
  user: ProfileUser
  isOwn?: boolean
}

export function ProfileHeader({ user, isOwn }: ProfileHeaderProps) {
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null

  return (
    <div className="bg-card border-b border-border/60">
      <div className="relative h-48 sm:h-64 lg:h-72 bg-muted overflow-hidden group">
        {user.coverImage ? (
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10" />
        )}
        {isOwn && (
          <button className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm text-sm font-medium px-3 py-1.5 rounded-lg border border-border/60 hover:bg-card transition-colors opacity-0 group-hover:opacity-100 shadow-sm">
            <Camera className="w-4 h-4" />
            Chỉnh ảnh bìa
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16 pb-4">
          <div className="relative flex-shrink-0 group w-fit">
            <Avatar className="w-28 h-28 sm:w-36 sm:h-36 ring-4 ring-card shadow-md">
              <AvatarImage src={user.image || "/placeholder.svg"} className="object-cover" />
              <AvatarFallback className="text-3xl font-bold bg-muted">{user.name[0]}</AvatarFallback>
            </Avatar>
            {isOwn && (
              <button className="absolute bottom-1 right-1 w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0 mt-2 sm:mt-0 sm:pb-1">
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {typeof user.isActive === "boolean" && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {user.isActive ? "Đang hoạt động" : "Chưa kích hoạt"}
                </span>
              )}
              {joinedDate && <span className="text-[11px] text-muted-foreground">Tham gia: {joinedDate}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:pb-1">
            {isOwn ? (
              <>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg font-medium">
                  <Camera className="w-4 h-4" />
                  Thêm ảnh
                </Button>
                <Button size="sm" className="gap-1.5 rounded-lg font-medium">
                  Chỉnh sửa trang cá nhân
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" className="gap-1.5 rounded-lg font-medium">
                  <UserPlus className="w-4 h-4" />
                  Thêm bạn
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg font-medium">
                  <MessageSquare className="w-4 h-4" />
                  Nhắn tin
                </Button>
                <Button variant="outline" size="icon" className="rounded-lg w-9 h-9">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <ProfileTabs />
      </div>
    </div>
  )
}
