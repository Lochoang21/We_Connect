/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  Users,
  MessageSquare,
  UserPlus,
  Clock,
  UserCheck,
  UserX,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  useSearchFriendsUsers,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useCancelFriendRequest,
  useUnfriend,
  usePendingRequests,
} from "../../hooks/useFriendsQuery"
import type { SearchFriendUser } from "../../types/friend.types"

// ─── Avatar helpers ───────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "from-blue-500 to-blue-700",
  "from-violet-500 to-violet-700",
  "from-emerald-500 to-emerald-700",
  "from-rose-500 to-rose-700",
  "from-amber-500 to-amber-600",
  "from-cyan-500 to-cyan-700",
]
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length]
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

// ─── Avatar ───────────────────────────────────────────────────────────────────
const UserAvatar = ({
  src,
  name,
  id,
  size = "lg",
}: {
  src?: string | null
  name: string
  id: number
  size?: "sm" | "lg"
}) => {
  const sizeClass = size === "lg" ? "w-16 h-16 text-xl" : "w-10 h-10 text-sm"
  return (
    <div
      className={`relative flex-shrink-0 ${sizeClass} rounded-full bg-gradient-to-br ${avatarColor(id)} flex items-center justify-center font-bold text-white ring-2 ring-white shadow-sm overflow-hidden`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = "none"
          }}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({
  isFriend,
  isIncoming,
  isOutgoing,
}: {
  isFriend?: boolean
  isIncoming?: boolean
  isOutgoing?: boolean
}) => {
  if (!isFriend && !isIncoming && !isOutgoing) return null

  if (isFriend)
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
        Friend
      </span>
    )
  if (isIncoming)
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
        Wants to connect
      </span>
    )
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
      Pending
    </span>
  )
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-100 rounded-full w-3/5" />
        <div className="h-2.5 bg-slate-100 rounded-full w-2/5" />
      </div>
    </div>
    <div className="mt-4 h-9 bg-slate-100 rounded-xl" />
  </div>
)

// ─── Action Buttons ───────────────────────────────────────────────────────────
const ActionArea = ({
  user,
  hasIncomingPending,
  isSending,
  isAccepting,
  isRejecting,
  isCancelling,
  isUnfriending,
  onSend,
  onAccept,
  onReject,
  onCancel,
  onUnfriend,
  onMessage,
}: {
  user: SearchFriendUser
  hasIncomingPending?: boolean
  isSending: boolean
  isAccepting: boolean
  isRejecting: boolean
  isCancelling: boolean
  isUnfriending: boolean
  onSend: () => void
  onAccept: () => void
  onReject: () => void
  onCancel: () => void
  onUnfriend: () => void
  onMessage: () => void
}) => {
  const isFriend = !user.friendship.canSendRequest && user.friendship?.status === "accepted"
  const isPending = !user.friendship.canSendRequest && user.friendship?.status === "pending"
  const isIncomingPending = isPending && Boolean(hasIncomingPending)
  const isOutgoingPending = isPending && !isIncomingPending

  const btnBase =
    "flex items-center justify-center gap-1.5 text-[13px] font-semibold rounded-xl px-3 py-2.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"

  if (isFriend)
    return (
      <div className="flex gap-2 mt-4">
        <button
          className={`${btnBase} flex-1 bg-blue-600 hover:bg-blue-700 text-white`}
          onClick={(e) => {
            e.stopPropagation()
            onMessage()
          }}
        >
          <MessageSquare size={13} /> Message
        </button>
        <button
          className={`${btnBase} bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-100 hover:border-red-200`}
          disabled={isUnfriending}
          onClick={(e) => {
            e.stopPropagation()
            onUnfriend()
          }}
        >
          <UserX size={13} />
        </button>
      </div>
    )

  if (isIncomingPending)
    return (
      <div className="flex gap-2 mt-4">
        <button
          className={`${btnBase} flex-1 bg-emerald-500 hover:bg-emerald-600 text-white`}
          disabled={isAccepting || isRejecting}
          onClick={(e) => {
            e.stopPropagation()
            onAccept()
          }}
        >
          <UserCheck size={13} />
          {isAccepting ? "Accepting…" : "Accept"}
        </button>
        <button
          className={`${btnBase} bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-100 hover:border-red-200`}
          disabled={isAccepting || isRejecting}
          onClick={(e) => {
            e.stopPropagation()
            onReject()
          }}
          title="Từ chối"
        >
          {isRejecting ? "…" : <UserX size={13} />}
        </button>
      </div>
    )

  if (isOutgoingPending)
    return (
      <div className="flex gap-2 mt-4">
        <div className="flex items-center gap-1.5 flex-1 text-[13px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
          <Clock size={13} /> Sent
        </div>
        <button
          className={`${btnBase} bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-100 text-xs`}
          disabled={isCancelling}
          onClick={(e) => {
            e.stopPropagation()
            onCancel()
          }}
        >
          {isCancelling ? "…" : "Recall"}
        </button>
      </div>
    )

  return (
    <button
      className={`${btnBase} w-full mt-4 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-100 hover:border-blue-600`}
      disabled={isSending}
      onClick={(e) => {
        e.stopPropagation()
        onSend()
      }}
    >
      <UserPlus size={13} />
      {isSending ? "Sending…" : "Add Friend"}
    </button>
  )
}

// ─── User Card ────────────────────────────────────────────────────────────────
interface UserCardProps {
  user: SearchFriendUser
  hasIncomingPending?: boolean
  isSending: boolean
  isAccepting: boolean
  isRejecting: boolean
  isCancelling: boolean
  isUnfriending: boolean
  onSend: (id: number) => void
  onAccept: (id: number) => void
  onReject: (id: number) => void
  onCancel: (id: number) => void
  onUnfriend: (id: number) => void
  onMessage: (id: number) => void
  onOpenProfile: (id: string) => void
  index: number
}

const UserCard = ({
  user,
  hasIncomingPending,
  isSending,
  isAccepting,
  isRejecting,
  isCancelling,
  isUnfriending,
  onSend,
  onAccept,
  onReject,
  onCancel,
  onUnfriend,
  onMessage,
  onOpenProfile,
  index,
}: UserCardProps) => {
  const userId = Number(user.id)
  const isFriend = !user.friendship.canSendRequest && user.friendship?.status === "accepted"
  const isPending = !user.friendship.canSendRequest && user.friendship?.status === "pending"
  const isIncomingPending = isPending && Boolean(hasIncomingPending)
  const isOutgoingPending = isPending && !isIncomingPending

  return (
    <div
      className="group bg-white border border-slate-100 rounded-2xl p-5 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 transition-all duration-200 cursor-pointer"
      style={{
        animation: "fadeUp 0.25s ease both",
        animationDelay: `${index * 0.04}s`,
      }}
      onClick={() => onOpenProfile(user.id)}
    >
      {/* Top row: avatar + name + badge */}
      <div className="flex items-center gap-3">
        <UserAvatar src={user.image} name={user.name} id={userId} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-bold text-slate-800 truncate leading-tight">
              {user.name}
            </p>
            <StatusBadge
              isFriend={isFriend}
              isIncoming={isIncomingPending}
              isOutgoing={isOutgoingPending}
            />
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
            @{user.name.toLowerCase().replace(/\s+/g, "")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <ActionArea
        user={user}
        hasIncomingPending={hasIncomingPending}
        isSending={isSending}
        isAccepting={isAccepting}
        isRejecting={isRejecting}
        isCancelling={isCancelling}
        isUnfriending={isUnfriending}
        onSend={() => onSend(userId)}
        onAccept={() => onAccept(userId)}
        onReject={() => onReject(userId)}
        onCancel={() => onCancel(userId)}
        onUnfriend={() => onUnfriend(userId)}
        onMessage={() => onMessage(userId)}
      />
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ query }: { query: string }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
      {query ? (
        <Search size={24} className="text-slate-300" />
      ) : (
        <Users size={24} className="text-slate-300" />
      )}
    </div>
    <div>
      <p className="text-[15px] font-bold text-slate-700 mb-1">
        {query ? "No results found" : "Search for people"}
      </p>
      <p className="text-sm text-slate-400 max-w-xs">
        {query
          ? `No users matched "${query}". Try a different name.`
          : "Type a name above to discover and connect with people."}
      </p>
    </div>
  </div>
)

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) => {
  const btnBase =
    "flex items-center gap-1 px-3.5 py-2 rounded-xl text-[13px] font-semibold border transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"

  // Build visible page numbers (max 7)
  const pages: (number | "…")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("…")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++)
      pages.push(i)
    if (page < totalPages - 2) pages.push("…")
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        className={`${btnBase} border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 bg-white`}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={14} /> Prev
      </button>

      <div className="flex gap-1">
        {pages.map((pg, i) =>
          pg === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="w-9 h-9 flex items-center justify-center text-slate-400 text-[13px]"
            >
              …
            </span>
          ) : (
            <button
              key={pg}
              onClick={() => onPageChange(pg as number)}
              className={`w-9 h-9 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
                pg === page
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 bg-white"
              }`}
            >
              {pg}
            </button>
          )
        )}
      </div>

      <button
        className={`${btnBase} border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 bg-white`}
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function SearchPeoplePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = (searchParams.get("q") ?? "").trim()
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [query])

  const { data, isLoading } = useSearchFriendsUsers(
    { query, current: page, pageSize: 12 },
    { enabled: query.length > 0 }
  )
  const { data: pendingData } = usePendingRequests({ current: 1, pageSize: 100 })

  const sendMutation = useSendFriendRequest()
  const acceptMutation = useAcceptFriendRequest()
  const rejectMutation = useRejectFriendRequest()
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
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-20">

          {/* Header */}
          {query && !isLoading && results.length > 0 && (
            <div className="flex items-center justify-between mb-6 animate-[fadeUp_0.2s_ease_both]">
              <div>
                <h1 className="text-xl font-extrabold text-slate-800 leading-tight">
                  People
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  <span className="text-blue-600 font-semibold">{total}</span>{" "}
                  result{total !== 1 ? "s" : ""} for{" "}
                  <span className="text-slate-600 font-semibold">"{query}"</span>
                </p>
              </div>
              <div className="h-8 px-3.5 flex items-center rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold">
                {total} found
              </div>
            </div>
          )}

          {/* Content */}
          {!query ? (
            <EmptyState query="" />
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <SkeletonCard key={i} delay={i * 0.06} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.map((user, i) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    index={i}
                    hasIncomingPending={incomingPendingIds.has(Number(user.id))}
                    isSending={
                      sendMutation.variables === Number(user.id) && sendMutation.isPending
                    }
                    isAccepting={
                      acceptMutation.variables === Number(user.id) && acceptMutation.isPending
                    }
                    isRejecting={
                      rejectMutation.variables === Number(user.id) && rejectMutation.isPending
                    }
                    isCancelling={
                      cancelMutation.variables === Number(user.id) && cancelMutation.isPending
                    }
                    isUnfriending={
                      unfriendMutation.variables === Number(user.id) && unfriendMutation.isPending
                    }
                    onSend={(id) => sendMutation.mutate(id)}
                    onAccept={(id) => acceptMutation.mutate(id)}
                    onReject={(id) => rejectMutation.mutate(id)}
                    onCancel={(id) => cancelMutation.mutate(id)}
                    onUnfriend={(id) => unfriendMutation.mutate(id)}
                    onMessage={(id) => navigate(`/messages/${id}`)}
                    onOpenProfile={(id) => navigate(`/profile/${id}`)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}