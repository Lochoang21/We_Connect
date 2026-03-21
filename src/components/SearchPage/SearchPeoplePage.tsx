/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Users, MapPin, Calendar, MessageSquare, UserPlus, Clock } from "lucide-react"
import { useSearchFriendsUsers, useSendFriendRequest } from "../../hooks/useFriendsQuery"
import type { SearchFriendUser } from "../../types/friend.types"

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#5B6AD0", "#D05B8A", "#5BA8D0", "#5BD0A0",
  "#D0925B", "#8A5BD0", "#5BD05B", "#D05B5B",
]
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length]
const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()

const UserAvatar = ({ src, name, id, size = 80 }: { src?: string | null; name: string; id: number; size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    overflow: "hidden", background: avatarColor(id),
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.3, fontWeight: 700, color: "#fff",
    border: "3px solid #fff",
    boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
  }}>
    {src
      ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
      : getInitials(name)}
  </div>
)

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }: { delay?: number }) => (
  <div style={{
    background: "#fff", borderRadius: 14, padding: "28px 20px 20px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
    border: "1px solid #ECEAE3",
    animation: `sp-pulse 1.4s ease-in-out ${delay}s infinite`,
  }}>
    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#ECEAE3" }} />
    <div style={{ width: "60%", height: 14, borderRadius: 6, background: "#ECEAE3" }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 7, width: "100%", alignItems: "center" }}>
      <div style={{ width: "45%", height: 11, borderRadius: 5, background: "#ECEAE3" }} />
      <div style={{ width: "55%", height: 11, borderRadius: 5, background: "#ECEAE3" }} />
      <div style={{ width: "50%", height: 11, borderRadius: 5, background: "#ECEAE3" }} />
    </div>
    <div style={{ width: "80%", height: 34, borderRadius: 8, background: "#ECEAE3", marginTop: 4 }} />
  </div>
)

// ─── User Card ────────────────────────────────────────────────────────────────
interface UserCardProps {
  user: SearchFriendUser
  isSending: boolean
  onSend: (id: number) => void
  onMessage: (id: number) => void
  onOpenProfile: (id: string) => void
}

const formatJoinDate = (dateStr?: string) => {
  if (!dateStr) return "April 2024"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  } catch {
    return "April 2024"
  }
}

const UserCard = ({ user, isSending, onSend, onMessage, onOpenProfile }: UserCardProps) => {
  const userId = Number(user.id)
  const isFriend = !user.friendship.canSendRequest && user.friendship?.status === "accepted"
  const isPending = !user.friendship.canSendRequest && user.friendship?.status === "pending"
  const mockFriendCount = ((userId * 17) % 100) + 1

  return (
    <div
      onClick={() => onOpenProfile(user.id)}
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "28px 20px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        border: "1px solid #ECEAE3",
        transition: "box-shadow 0.18s, transform 0.18s",
        animation: "sp-fadein 0.22s ease both",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"
        el.style.transform = "translateY(-2px)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = "none"
        el.style.transform = "translateY(0)"
      }}
    >
      {/* Avatar */}
      <UserAvatar src={user.image} name={user.name} id={userId} size={80} />

      {/* Name */}
      <p style={{
        margin: "14px 0 12px",
        fontSize: 15.5, fontWeight: 700,
        color: "#111",
        textAlign: "center",
        lineHeight: 1.3,
      }}>
        {user.name}
      </p>

      {/* Meta info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
          <Users size={13} style={{ color: "#9A9890", flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: "#6B6A66" }}>
            {/* friends count placeholder — replace with real data if available */}
            {mockFriendCount} Friends
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
          <MapPin size={13} style={{ color: "#9A9890", flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: "#6B6A66", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {/* location placeholder */}
            Ho Chi Minh City
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
          <Calendar size={13} style={{ color: "#9A9890", flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: "#6B6A66" }}>
            Joined {formatJoinDate(user.createdAt)}
          </span>
        </div>
      </div>

      {/* Action button */}
      {isFriend ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMessage(userId)
          }}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, padding: "9px 16px", borderRadius: 8,
            background: "#1A6ED8", color: "#fff",
            border: "none", cursor: "pointer",
            fontSize: 13.5, fontWeight: 600,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#155BBF" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1A6ED8" }}
        >
          <MessageSquare size={14} />
          Message
        </button>
      ) : isPending ? (
        <button
          onClick={(e) => e.stopPropagation()}
          disabled
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, padding: "9px 16px", borderRadius: 8,
            background: "#F0F4FF", color: "#1A6ED8",
            border: "1.5px solid #C7D9F8", cursor: "not-allowed",
            fontSize: 13.5, fontWeight: 600, opacity: 0.9,
          }}
        >
          <Clock size={14} />
          Request Sent
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSend(userId)
          }}
          disabled={isSending}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, padding: "9px 16px", borderRadius: 8,
            background: isSending ? "#F0F4FF" : "#F0F4FF",
            color: "#1A6ED8",
            border: "1.5px solid #C7D9F8",
            cursor: isSending ? "not-allowed" : "pointer",
            fontSize: 13.5, fontWeight: 600,
            transition: "all 0.15s",
            opacity: isSending ? 0.7 : 1,
          }}
          onMouseEnter={(e) => { if (!isSending) { (e.currentTarget as HTMLButtonElement).style.background = "#1A6ED8"; (e.currentTarget as HTMLButtonElement).style.color = "#fff" } }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0F4FF"; (e.currentTarget as HTMLButtonElement).style.color = "#1A6ED8" }}
        >
          <UserPlus size={14} />
          {isSending ? "Sending..." : "Add Friend"}
        </button>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function SearchPeoplePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = (searchParams.get("q") ?? "").trim()

  const [page, setPage] = useState(1)

  // Reset paging when search query changes
  useEffect(() => {
    setPage(1)
  }, [query])

  const { data, isLoading } = useSearchFriendsUsers(
    { query, current: page, pageSize: 12 },
    { enabled: query.length > 0 }
  )

  const sendMutation = useSendFriendRequest()

  const results: SearchFriendUser[] = data?.result ?? []
  const totalPages = data?.totalPage ?? 1

  return (
    <>
      <style>{`
        @keyframes sp-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes sp-fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F5F4F0", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px" }}>

          {/* Results */}
          {!query ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#AEACA4" }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>👥</div>
              <p style={{ fontSize: 15, margin: 0 }}>Nhập từ khóa ở thanh tìm kiếm phía trên để tìm người dùng</p>
            </div>
          ) : isLoading ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} delay={i * 0.07} />)}
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#AEACA4" }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>🔍</div>
              <p style={{ fontSize: 15, margin: 0 }}>Không tìm thấy kết quả cho <strong>"{query}"</strong></p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: "#9A9890", margin: "0 0 16px" }}>
                {data?.total ?? results.length} kết quả
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
              }}>
                {results.map((user, i) => (
                  <div key={user.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <UserCard
                      user={user}
                      isSending={sendMutation.variables === Number(user.id) && sendMutation.isPending}
                      onSend={(id) => sendMutation.mutate(id)}
                      onMessage={(id) => navigate(`/messages/${id}`)}
                      onOpenProfile={(id) => navigate(`/profile/${id}`)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 32 }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: "8px 16px", borderRadius: 8, border: "1.5px solid #E2E0D8",
                      background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer",
                      fontSize: 13, fontWeight: 500, color: page === 1 ? "#AEACA4" : "#1A1A1A",
                      transition: "all 0.15s",
                    }}
                  >
                    ← Trước
                  </button>
                  <span style={{ fontSize: 13, color: "#9A9890" }}>
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      padding: "8px 16px", borderRadius: 8, border: "1.5px solid #E2E0D8",
                      background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer",
                      fontSize: 13, fontWeight: 500, color: page === totalPages ? "#AEACA4" : "#1A1A1A",
                      transition: "all 0.15s",
                    }}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}