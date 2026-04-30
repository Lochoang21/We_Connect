import { Phone, Video, Info, Search, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface ChatHeaderProps {
  contact: ChatContact | null;
  className?: string;
}

export function ChatHeader({ contact, className }: ChatHeaderProps) {
  if (!contact) {
    return (
      <div
        className={cn(
          "h-16 border-b border-border flex items-center px-6 bg-card/50 backdrop-blur-sm",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-muted rounded animate-pulse" />
            <div className="h-2.5 w-16 bg-muted/60 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "h-16 border-b border-border flex items-center justify-between px-6",
        "bg-card/60 backdrop-blur-sm",
        "transition-all duration-200",
        className
      )}
    >
      {/* Left: Contact Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <Avatar className="w-10 h-10 ring-2 ring-background shadow-sm">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          {contact.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-background" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-sm text-foreground leading-tight truncate">
            {contact.name}
          </h2>
          <p className="text-xs text-muted-foreground leading-tight">
            {contact.isOnline ? (
              <span className="text-emerald-500 font-medium">Đang hoạt động</span>
            ) : (
              contact.lastSeen ?? "Không hoạt động"
            )}
          </p>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
          title="Tìm kiếm trong cuộc trò chuyện"
        >
          <Search size={17} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
          title="Gọi điện"
        >
          <Phone size={17} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
          title="Gọi video"
        >
          <Video size={17} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
          title="Thông tin cuộc trò chuyện"
        >
          <Info size={17} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
          title="Thêm"
        >
          <MoreHorizontal size={17} />
        </Button>
      </div>
    </div>
  );
}