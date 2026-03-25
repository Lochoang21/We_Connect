/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  Users, 
  // MapPin, Calendar, 
  MessageSquare, UserPlus,
  Clock, UserCheck, UserX, Search, ChevronLeft, ChevronRight,
} from "lucide-react"
import {
  useSearchFriendsUsers,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useUnfriend,
  usePendingRequests,
} from "../../hooks/useFriendsQuery"
import type { SearchFriendUser } from "../../types/friend.types"

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  primaryLight: "#EFF6FF",
  primaryMid: "#BFDBFE",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  dangerMid: "#FECACA",
  success: "#059669",
  successLight: "#ECFDF5",
  successMid: "#A7F3D0",
  warn: "#D97706",
  warnLight: "#FFFBEB",
  warnMid: "#FDE68A",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  text: "#0F172A",
  textSub: "#475569",
  textMuted: "#94A3B8",
  skeleton: "#F1F5F9",
}

const AVATAR_PALETTE: [string, string][] = [
  ["#1E40AF", "#3B82F6"],
  ["#7C3AED", "#A78BFA"],
  ["#065F46", "#34D399"],
  ["#9D174D", "#F472B6"],
  ["#92400E", "#FCD34D"],
  ["#1E3A5F", "#60A5FA"],
]
const avatarGrad = (id: number) => AVATAR_PALETTE[id % AVATAR_PALETTE.length]
const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()

// ─── Global styles ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  .sp-root { font-family: 'Plus Jakarta Sans', sans-serif; }

  @keyframes sp-pulse {
    0%, 100% { opacity: 1 }
    50%       { opacity: 0.45 }
  }
  @keyframes sp-in {
    from { opacity: 0; transform: translateY(10px) }
    to   { opacity: 1; transform: translateY(0) }
  }

  .sp-card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 24px 20px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
    cursor: pointer;
    animation: sp-in 0.22s ease both;
    position: relative;
    overflow: hidden;
  }
  .sp-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${C.primary}, #60A5FA);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .sp-card:hover {
    box-shadow: 0 8px 32px rgba(37,99,235,0.10), 0 2px 8px rgba(0,0,0,0.05);
    transform: translateY(-3px);
    border-color: ${C.primaryMid};
  }
  .sp-card:hover::before { opacity: 1; }

  .sp-btn {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; padding: 9px 14px; border-radius: 8px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    border: none; transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    white-space: nowrap;
    line-height: 1;
  }
  .sp-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .sp-btn-primary { background: ${C.primary}; color: #fff; }
  .sp-btn-primary:not(:disabled):hover { background: ${C.primaryHover}; }

  .sp-btn-ghost {
    background: ${C.primaryLight}; color: ${C.primary};
    border: 1.5px solid ${C.primaryMid};
  }
  .sp-btn-ghost:not(:disabled):hover {
    background: ${C.primary}; color: #fff; border-color: ${C.primary};
  }

  .sp-btn-success { background: ${C.success}; color: #fff; }
  .sp-btn-success:not(:disabled):hover { background: #047857; }

  .sp-btn-neutral {
    background: #F8FAFC; color: ${C.textSub};
    border: 1.5px solid ${C.border};
  }
  .sp-btn-neutral:not(:disabled):hover { background: ${C.border}; }

  .sp-btn-danger {
    background: ${C.dangerLight}; color: ${C.danger};
    border: 1.5px solid ${C.dangerMid};
  }
  .sp-btn-danger:not(:disabled):hover {
    background: ${C.danger}; color: #fff; border-color: ${C.danger};
  }

  .sp-badge-warn {
    display: flex; align-items: center; gap: 5px;
    padding: 9px 12px; border-radius: 8px;
    background: ${C.warnLight}; color: ${C.warn};
    border: 1.5px solid ${C.warnMid};
    font-size: 13px; font-weight: 600;
    line-height: 1;
  }

  .sp-pagbtn {
    display: flex; align-items: center; gap: 4px;
    padding: 8px 16px; border-radius: 8px;
    border: 1.5px solid ${C.border};
    background: ${C.surface};
    font-size: 13px; font-weight: 600; color: ${C.textSub};
    cursor: pointer; transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .sp-pagbtn:not(:disabled):hover {
    border-color: ${C.primary}; color: ${C.primary}; background: ${C.primaryLight};
  }
  .sp-pagbtn:disabled { opacity: 0.45; cursor: not-allowed; }

  .sp-pgnum {
    width: 36px; height: 36px; border-radius: 8px;
    font-size: 13px; cursor: pointer;
    transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    display: flex; align-items: center; justify-content: center;
  }
`

// ─── Avatar ───────────────────────────────────────────────────────────────────
const UserAvatar = ({
  src, name, id, size = 72,
}: { src?: string | null; name: string; id: number; size?: number }) => {
  const [from, to] = avatarGrad(id)
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      overflow: "hidden",
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.32, fontWeight: 800, color: "#fff",
      letterSpacing: "-0.5px",
      boxShadow: `0 0 0 3px #fff, 0 0 0 5px ${from}44`,
    }}>
      {src
        ? <img src={src} alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
        : getInitials(name)}
    </div>
  )
}

// ─── Status pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ isFriend, isIncoming, isOutgoing }: {
  isFriend?: boolean; isIncoming?: boolean; isOutgoing?: boolean
}) => {
  if (!isFriend && !isIncoming && !isOutgoing) return null
  const pill = isFriend
    ? { bg: C.successLight, color: C.success, border: C.successMid, label: "✓ Friend" }
    : isIncoming
      ? { bg: C.primaryLight, color: C.primary, border: C.primaryMid, label: "Sent you a request" }
      : { bg: C.warnLight, color: C.warn, border: C.warnMid, label: "Pending" }

  return (
    <div style={{
      position: "absolute", top: 14, right: 14,
      background: pill.bg, color: pill.color,
      border: `1px solid ${pill.border}`,
      borderRadius: 20, padding: "2px 9px",
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.3px",
      lineHeight: 1.6,
    }}>
      {pill.label}
    </div>
  )
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }: { delay?: number }) => (
  <div style={{
    background: C.surface, borderRadius: 16, padding: "24px 20px 20px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
    border: `1px solid ${C.border}`,
    animation: `sp-pulse 1.5s ease-in-out ${delay}s infinite`,
  }}>
    <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.skeleton }} />
    <div style={{ width: "55%", height: 13, borderRadius: 6, background: C.skeleton }} />
    <div style={{ width: "38%", height: 10, borderRadius: 4, background: C.skeleton }} />
    <div style={{ width: "100%", height: 1, background: C.skeleton }} />
    {[48, 58, 52].map((w, i) => (
      <div key={i} style={{ width: `${w}%`, height: 10, borderRadius: 4, background: C.skeleton }} />
    ))}
    <div style={{ width: "100%", height: 36, borderRadius: 8, background: C.skeleton, marginTop: 4 }} />
  </div>
)

// ─── Meta row ────────────────────────────────────────────────────────────────
// const MetaRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
//   <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//     <span style={{ color: C.textMuted, display: "flex", flexShrink: 0 }}>{icon}</span>
//     <span style={{
//       fontSize: 12.5, color: C.textSub,
//       overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//     }}>
//       {children}
//     </span>
//   </div>
// )

// ─── Helpers ──────────────────────────────────────────────────────────────────
// const formatJoinDate = (dateStr?: string) => {
//   if (!dateStr) return "April 2024"
//   try {
//     return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" })
//   } catch { return "April 2024" }
// }

// ─── User Card ────────────────────────────────────────────────────────────────
interface UserCardProps {
  user: SearchFriendUser
  hasIncomingPending?: boolean
  isSending: boolean
  isAccepting: boolean
  isCancelling: boolean
  isUnfriending: boolean
  onSend: (id: number) => void
  onAccept: (id: number) => void
  onCancel: (id: number) => void
  onUnfriend: (id: number) => void
  onMessage: (id: number) => void
  onOpenProfile: (id: string) => void
}

const UserCard = ({
  user, hasIncomingPending, isSending, isAccepting,
  isCancelling, isUnfriending, onSend, onAccept, onCancel,
  onUnfriend, onMessage, onOpenProfile,
}: UserCardProps) => {
  const userId = Number(user.id)
  const isFriend = !user.friendship.canSendRequest && user.friendship?.status === "accepted"
  const isPending = !user.friendship.canSendRequest && user.friendship?.status === "pending"
  const isIncomingPending = isPending && Boolean(hasIncomingPending)
  const isOutgoingPending = isPending && !isIncomingPending
  // const mockFriendCount = ((userId * 17) % 100) + 1

  return (
    <div className="sp-card" onClick={() => onOpenProfile(user.id)}>
      <StatusPill isFriend={isFriend} isIncoming={isIncomingPending} isOutgoing={isOutgoingPending} />

      {/* Avatar */}
      <UserAvatar src={user.image} name={user.name} id={userId} size={72} />

      {/* Name */}
      <p style={{
        margin: "14px 0 2px", fontSize: 15, fontWeight: 700,
        color: C.text, textAlign: "center", lineHeight: 1.3,
        maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {user.name}
      </p>

      {/* Handle */}
      <p style={{ margin: "0 0 14px", fontSize: 12, color: C.textMuted, fontWeight: 500 }}>
        @{user.name.toLowerCase().replace(/\s+/g, "")}
      </p>

      {/* Divider */}
      <div style={{ width: "100%", height: 1, background: C.border, marginBottom: 14 }} />

      {/* Meta */}
      {/* <div style={{ display: "flex", flexDirection: "column", gap: 7, width: "100%", marginBottom: 18 }}>
        <MetaRow icon={<Users size={12.5} />}>
          <strong style={{ color: C.text }}>{mockFriendCount}</strong>&nbsp;friends
        </MetaRow>
        <MetaRow icon={<MapPin size={12.5} />}>
          Ho Chi Minh City, Vietnam
        </MetaRow>
        <MetaRow icon={<Calendar size={12.5} />}>
          Joined {formatJoinDate(user.createdAt)}
        </MetaRow>
      </div> */}

      {/* Actions */}
      {isFriend ? (
        <div>
          <button
            className="sp-btn sp-btn-primary mb-2"
            style={{ flex: 1 }}
            onClick={(e) => { e.stopPropagation(); onMessage(userId) }}
          >
            <MessageSquare size={13} /> Message
          </button>
          <button
            className="sp-btn sp-btn-danger"
            style={{ flex: 1 }}
            disabled={isUnfriending}
            onClick={(e) => { e.stopPropagation(); onUnfriend(userId) }}
          >
            <UserX size={13} />
            {isUnfriending ? "Removing…" : "Unfriend"}
          </button>
        </div>
      ) : isIncomingPending ? (
        <div>
          <button
            className=" sp-btn sp-btn-success mb-2"
            style={{ flex: 1 }}
            disabled={isAccepting || isCancelling}
            onClick={(e) => { e.stopPropagation(); onAccept(userId) }}
          >
            <UserCheck size={13} />
            {isAccepting ? "Accepting…" : "Accept"}
          </button>
          <button
            className="sp-btn sp-btn-neutral"
            style={{ flex: 1 }}
            disabled={isAccepting || isCancelling}
            onClick={(e) => { e.stopPropagation(); onCancel(userId) }}
          >
            <UserX size={13} />
            {isCancelling ? "Declining…" : "Decline"}
          </button>
        </div>
      ) : isOutgoingPending ? (
        <div>
          <div className="sp-badge-warn mb-2 text-center" style={{ flex: 1, justifyContent: "center" }}>
            <Clock size={13} /> Request Sent
          </div>
          <button
            className="sp-btn sp-btn-neutral mx-auto"
            disabled={isCancelling}
            onClick={(e) => { e.stopPropagation(); onCancel(userId) }}
          >
            {isCancelling ? "…" : "Recall"}
          </button>
        </div>
      ) : (
        <button
          className="sp-btn sp-btn-ghost"
          style={{ width: "100%" }}
          disabled={isSending}
          onClick={(e) => { e.stopPropagation(); onSend(userId) }}
        >
          <UserPlus size={13} />
          {isSending ? "Sending…" : "Add Friend"}
        </button>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ query }: { query: string }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "72px 24px", gap: 12,
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: "50%",
      background: C.primaryLight,
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: 4,
    }}>
      {query ? <Search size={28} color={C.primary} /> : <Users size={28} color={C.primary} />}
    </div>
    <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>
      {query ? "No results found" : "Find people you know"}
    </p>
    <p style={{ fontSize: 13.5, color: C.textMuted, margin: 0, textAlign: "center", maxWidth: 300 }}>
      {query
        ? `No one matched "${query}". Try a different name.`
        : "Use the search bar above to discover and connect with users."}
    </p>
  </div>
)

// ─── Main page ────────────────────────────────────────────────────────────────
export function SearchPeoplePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = (searchParams.get("q") ?? "").trim()
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [query])

  const { data, isLoading } = useSearchFriendsUsers(
    { query, current: page, pageSize: 12 },
    { enabled: query.length > 0 }
  )
  const { data: pendingData } = usePendingRequests({ current: 1, pageSize: 100 })

  const sendMutation = useSendFriendRequest()
  const acceptMutation = useAcceptFriendRequest()
  const cancelMutation = useCancelFriendRequest()
  const unfriendMutation = useUnfriend()

  const results: SearchFriendUser[] = data?.result ?? []
  const totalPages = data?.totalPage ?? 1
  const total = data?.total ?? results.length
  const incomingPendingIds = new Set(
    (pendingData?.result ?? []).map((item) => Number(item.sender.id))
  )

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="sp-root" style={{ minHeight: "100vh", background: C.bg }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 20px 80px" }}>

          {/* Header */}
          {query && !isLoading && results.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 24,
            }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: "0 0 3px" }}>
                  People
                </h1>
                <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
                  Showing&nbsp;
                  <span style={{ color: C.primary, fontWeight: 600 }}>{total}</span>
                  &nbsp;result{total !== 1 ? "s" : ""} for&nbsp;
                  <span style={{ color: C.text, fontWeight: 600 }}>"{query}"</span>
                </p>
              </div>
              <div style={{
                padding: "6px 14px",
                background: C.primaryLight,
                borderRadius: 20,
                border: `1px solid ${C.primaryMid}`,
                fontSize: 12.5, fontWeight: 700, color: C.primary,
              }}>
                {total} found
              </div>
            </div>
          )}

          {/* Content */}
          {!query ? (
            <EmptyState query="" />
          ) : isLoading ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: 16,
            }}>
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} delay={i * 0.07} />)}
            </div>
          ) : results.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                gap: 16,
              }}>
                {results.map((user, i) => (
                  <div key={user.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <UserCard
                      user={user}
                      hasIncomingPending={incomingPendingIds.has(Number(user.id))}
                      isSending={sendMutation.variables === Number(user.id) && sendMutation.isPending}
                      isAccepting={acceptMutation.variables === Number(user.id) && acceptMutation.isPending}
                      isCancelling={cancelMutation.variables === Number(user.id) && cancelMutation.isPending}
                      isUnfriending={unfriendMutation.variables === Number(user.id) && unfriendMutation.isPending}
                      onSend={(id) => sendMutation.mutate(id)}
                      onAccept={(id) => acceptMutation.mutate(id)}
                      onCancel={(id) => cancelMutation.mutate(id)}
                      onUnfriend={(id) => unfriendMutation.mutate(id)}
                      onMessage={(id) => navigate(`/messages/${id}`)}
                      onOpenProfile={(id) => navigate(`/profile/${id}`)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 10, marginTop: 40,
                }}>
                  <button
                    className="sp-pagbtn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={15} /> Previous
                  </button>

                  <div style={{ display: "flex", gap: 4 }}>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const pg = i + 1
                      const active = pg === page
                      return (
                        <button
                          key={pg}
                          className="sp-pgnum"
                          onClick={() => setPage(pg)}
                          style={{
                            border: active ? "none" : `1.5px solid ${C.border}`,
                            background: active ? C.primary : C.surface,
                            color: active ? "#fff" : C.textSub,
                            fontWeight: active ? 700 : 500,
                          }}
                        >
                          {pg}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    className="sp-pagbtn"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next <ChevronRight size={15} />
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