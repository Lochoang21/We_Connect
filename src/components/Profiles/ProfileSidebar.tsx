import { Calendar, Mail, MapPin, Phone } from "lucide-react"
import type { ProfileUser } from "@/components/Profiles/types"

function IntroCard({ user }: { user: ProfileUser }) {
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null

  const updatedDate = user.updatedAt
    ? new Date(user.updatedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
      <h3 className="font-semibold text-base mb-3">Giới thiệu</h3>

      <p className="text-sm text-foreground/80 leading-relaxed mb-4">{user.bio || "Chưa cập nhật tiểu sử"}</p>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>{user.phone || "Chưa cập nhật số điện thoại"}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{user.address || "Chưa cập nhật địa chỉ"}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>{joinedDate ? `Tham gia: ${joinedDate}` : "Chưa có ngày tham gia"}</span>
        </div>
        {updatedDate && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Cập nhật lần cuối: {updatedDate}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface ProfileSidebarProps {
  user: ProfileUser
}

export function ProfileSidebar({ user }: ProfileSidebarProps) {
  return (
    <aside className="w-full lg:w-[340px] flex-shrink-0 space-y-3">
      <IntroCard user={user} />
    </aside>
  )
}
