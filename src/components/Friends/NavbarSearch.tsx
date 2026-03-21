import { useState, useEffect, useRef } from "react"
import { Search, X, ArrowRight } from "lucide-react"
import { useSearchFriendsUsers } from "../../hooks/useFriendsQuery"
import { useNavigate } from "react-router-dom"
import type { SearchFriendUser } from "../../types/friend.types"

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#6366f1", "#ec4899", "#0ea5e9", "#10b981",
  "#f59e0b", "#8b5cf6", "#14b8a6", "#f43f5e",
]
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length]
const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()

const MiniAvatar = ({ src, name, id }: { src?: string | null; name: string; id: number }) => (
  <div
    className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-[13px] font-bold text-white ring-2 ring-white ring-offset-0"
    style={{ background: avatarColor(id) }}
  >
    {src
      ? <img
          src={src} alt={name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
        />
      : getInitials(name)}
  </div>
)

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = ({ delay = "0s" }: { delay?: string }) => (
  <div className="flex items-center gap-3 px-4 py-2.5">
    <div
      className="w-9 h-9 rounded-full flex-shrink-0 bg-muted animate-pulse"
      style={{ animationDelay: delay }}
    />
    <div className="flex-1 flex flex-col gap-1.5">
      <div
        className="h-3 w-[42%] rounded-full bg-muted animate-pulse"
        style={{ animationDelay: delay }}
      />
      <div
        className="h-2.5 w-[64%] rounded-full bg-muted animate-pulse"
        style={{ animationDelay: delay }}
      />
    </div>
  </div>
)

// ─── Main ─────────────────────────────────────────────────────────────────────
export function NavbarSearch() {
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce 1500ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue.trim()), 1500)
    return () => clearTimeout(t)
  }, [inputValue])

  useEffect(() => {
    setOpen(debouncedQuery.length > 0)
  }, [debouncedQuery])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const { data: searchData, isLoading } = useSearchFriendsUsers(
    { query: debouncedQuery, current: 1, pageSize: 6 },
    { enabled: debouncedQuery.length > 0 }
  )

  const results: SearchFriendUser[] = searchData?.result ?? []

  const goToSearch = () => {
    if (!inputValue.trim()) return
    setOpen(false)
    setFocused(false)
    inputRef.current?.blur()
    navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") goToSearch()
    if (e.key === "Escape") {
      setOpen(false)
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  const handleClear = () => {
    setInputValue("")
    setDebouncedQuery("")
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={wrapperRef} className="relative flex items-center gap-2 flex-1 max-w-[440px]">

      {/* ── Input pill ── */}
      <div className="relative flex-1">
        <Search
          size={15}
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
            focused ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm bạn bè, người dùng..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            setFocused(true)
            if (debouncedQuery.length > 0) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          className={`
            w-full h-[38px] rounded-full border bg-muted/60 text-foreground text-[13.5px]
            pl-9 pr-8 outline-none transition-all duration-200
            placeholder:text-muted-foreground/70
            focus:bg-background focus:border-primary/40 focus:ring-4 focus:ring-primary/10
            ${focused ? "border-primary/40" : "border-transparent"}
          `}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
              bg-muted-foreground/20 hover:bg-muted-foreground/35 text-muted-foreground
              hover:text-foreground flex items-center justify-center transition-all duration-150"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* ── Search button ── */}
      <button
        onClick={goToSearch}
        disabled={!inputValue.trim()}
        className="h-[38px] px-4 rounded-full flex items-center gap-1.5 flex-shrink-0
          text-[13px] font-semibold transition-all duration-150
          disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
          bg-primary text-primary-foreground
          hover:enabled:brightness-110 hover:enabled:-translate-y-px hover:enabled:shadow-lg
          hover:enabled:shadow-primary/30 active:enabled:translate-y-0"
      >
        <Search size={13} />
        Tìm
      </button>

      {/* ── Dropdown ── */}
      {open && debouncedQuery.length > 0 && (
        <div className="absolute top-[calc(100%+10px)] left-0 right-0 z-[9999]
          bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl overflow-hidden
          shadow-xl shadow-black/10
          animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
            <span className="text-[10.5px] font-bold tracking-widest uppercase text-muted-foreground/70">
              {isLoading ? "Đang tìm..." : `${results.length} kết quả`}
            </span>
            {!isLoading && results.length > 0 && (
              <button
                onClick={goToSearch}
                className="flex items-center gap-1 text-[12px] font-semibold text-primary
                  hover:opacity-75 transition-opacity"
              >
                Xem tất cả <ArrowRight size={11} />
              </button>
            )}
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="py-1.5">
              {(["0s", "0.08s", "0.16s", "0.24s"] as const).map((d, i) => (
                <SkeletonRow key={i} delay={d} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="py-7 px-4 text-center">
              <div className="text-3xl mb-2 opacity-40">🔍</div>
              <p className="text-[13px] text-muted-foreground m-0">
                Không tìm thấy <strong>"{debouncedQuery}"</strong>
              </p>
            </div>
          ) : (
            <>
              <div className="py-1">
                {results.map((user, i) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setOpen(false)
                      setFocused(false)
                      navigate(`/profile/${user.id}`)
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer
                      hover:bg-muted/50 transition-colors duration-100"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <MiniAvatar src={user.image} name={user.name} id={Number(user.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-[13.5px] font-semibold text-foreground
                        truncate leading-snug">
                        {user.name}
                      </p>
                      <p className="m-0 text-[12px] text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                onClick={goToSearch}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5
                  border-t border-border/50 cursor-pointer
                  text-[13px] font-semibold text-primary
                  hover:bg-primary/5 transition-colors duration-100"
              >
                <Search size={13} />
                Xem tất cả kết quả cho&nbsp;
                <span className="text-primary">"{debouncedQuery}"</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}