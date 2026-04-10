import { MessageSquare, ChevronDown, User, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logoutAsync } from "@/redux/slices/authSlice"
import type { RootState, AppDispatch } from "@/redux/store"
import { NavbarSearch } from "../Friends/NavbarSearch"
import { NotificationDropdown } from "../Notifications/NotificationDropdown"

export function Navbar() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)

  const handleLogout = async () => {
    await dispatch(logoutAsync())
    navigate("/login")
  }

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  return (
    <nav className="sticky top-0 z-50 bg-card/85 backdrop-blur-xl border-b border-border/60">
      <div className="flex items-center justify-between gap-6 px-6 h-[58px] max-w-[1400px] mx-auto">

        {/* ── Logo ── */}
        <a
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0 no-underline group"
        >
          <div className="w-[34px] h-[34px] bg-primary rounded-[10px] flex items-center justify-center
            shadow-md shadow-primary/30
            transition-all duration-150 group-hover:-translate-y-px group-hover:shadow-lg group-hover:shadow-primary/40"
          >
            <span className="text-primary-foreground font-extrabold text-[15px]">W</span>
          </div>
          <span className="text-[16px] font-bold text-foreground tracking-tight">
            WeShare
          </span>
        </a>

        {/* ── Search — centred ── */}
        <div className="flex-1 flex justify-center">
          <NavbarSearch />
        </div>

        {/* ── Right zone ── */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Notification */}
          <NotificationDropdown />

          {/* Messages */}
          <button
            title="Tin nhắn"
            onClick={() => navigate("/messages")}
            className="relative w-[38px] h-[38px] rounded-full flex items-center justify-center
              bg-muted/60 text-foreground/75
              hover:bg-muted hover:text-foreground hover:-translate-y-px
              transition-all duration-150 cursor-pointer border-0"
          >
            <MessageSquare size={18} />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-border/60 mx-1 flex-shrink-0" />

          {/* ── User dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full
                  border border-border/60 bg-transparent cursor-pointer
                  hover:bg-muted/50 hover:border-border
                  transition-all duration-150 focus:outline-none"
              >
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarImage src={user?.image || ""} />
                  <AvatarFallback className="text-[11px] font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[13.5px] font-semibold text-foreground
                  max-w-[120px] truncate hidden sm:block">
                  {user?.name || "User"}
                </span>
                <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-[220px] rounded-2xl border border-border/60
                shadow-xl shadow-black/10 p-0 overflow-hidden"
            >
              {/* User info header */}
              <div className="px-3.5 py-3 border-b border-border/50">
                <p className="m-0 text-[13.5px] font-bold text-foreground leading-snug">
                  {user?.name || "User"}
                </p>
                <p className="m-0 mt-0.5 text-[12px] text-muted-foreground truncate">
                  {user?.email || ""}
                </p>
              </div>

              <div className="p-1.5">
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="rounded-lg text-[13.5px] cursor-pointer gap-2.5 px-2.5 py-2"
                >
                  <User size={15} />
                  Trang cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/settings")}
                  className="rounded-lg text-[13.5px] cursor-pointer gap-2.5 px-2.5 py-2"
                >
                  <Settings size={15} />
                  Cài đặt
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="my-0" />

              <div className="p-1.5">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg text-[13.5px] cursor-pointer gap-2.5 px-2.5 py-2
                    text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut size={15} />
                  Đăng xuất
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </nav>
  )
}