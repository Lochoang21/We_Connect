import { useState } from "react";
import { Check, CheckCheck, Clock, MoreHorizontal, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  status?: MessageStatus;
  isOwn: boolean;
  /** If true, show avatar/name above (first in a group from same sender) */
  isGroupStart?: boolean;
  /** If true, add extra bottom gap (last in a group) */
  isGroupEnd?: boolean;
  reactions?: { emoji: string; count: number; reactedByMe: boolean }[];
}

interface MessageBubbleProps {
  message: Message;
  senderName?: string;
  senderAvatar?: string;
}

function StatusIcon({ status }: { status?: MessageStatus }) {
  if (!status) return null;
  switch (status) {
    case "sending":
      return <Clock size={11} className="text-muted-foreground/60" />;
    case "sent":
      return <Check size={11} className="text-muted-foreground/60" />;
    case "delivered":
      return <CheckCheck size={11} className="text-muted-foreground/60" />;
    case "read":
      return <CheckCheck size={11} className="text-primary" />;
    case "failed":
      return <span className="text-destructive text-[10px] font-medium">!</span>;
    default:
      return null;
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message, senderName, senderAvatar }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const initials = senderName
    ? senderName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div
      className={cn(
        "flex items-end gap-2 group",
        message.isOwn ? "flex-row-reverse" : "flex-row",
        message.isGroupEnd ? "mb-3" : "mb-0.5"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar (other side only) */}
      <div className="w-7 h-7 shrink-0">
        {!message.isOwn && message.isGroupEnd && (
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center ring-1 ring-border overflow-hidden">
            {senderAvatar ? (
              <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        )}
      </div>

      {/* Bubble + Meta */}
      <div className={cn("flex flex-col gap-0.5 max-w-[65%]", message.isOwn ? "items-end" : "items-start")}>
        {/* Sender name (group start, not own) */}
        {!message.isOwn && message.isGroupStart && senderName && (
          <span className="text-[11px] font-medium text-muted-foreground px-1 mb-0.5">
            {senderName}
          </span>
        )}

        <div className="flex items-end gap-1.5">
          {/* Hover actions */}
          <div
            className={cn(
              "flex items-center gap-0.5 transition-opacity duration-150",
              showActions ? "opacity-100" : "opacity-0",
              message.isOwn ? "order-first" : "order-last"
            )}
          >
            <button className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Smile size={13} />
            </button>
            <button className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal size={13} />
            </button>
          </div>

          {/* Bubble */}
          <div
            className={cn(
              "relative px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm",
              "transition-all duration-150",
              message.isOwn
                ? [
                    "bg-primary text-primary-foreground",
                    message.isGroupStart && !message.isGroupEnd && "rounded-br-md",
                    !message.isGroupStart && message.isGroupEnd && "rounded-tr-md",
                    !message.isGroupStart && !message.isGroupEnd && "rounded-r-md",
                  ]
                : [
                    "bg-card text-card-foreground border border-border/60",
                    message.isGroupStart && !message.isGroupEnd && "rounded-bl-md",
                    !message.isGroupStart && message.isGroupEnd && "rounded-tl-md",
                    !message.isGroupStart && !message.isGroupEnd && "rounded-l-md",
                  ]
            )}
          >
            <p className="break-words whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-0.5 px-1">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs",
                  "border transition-colors",
                  r.reactedByMe
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted border-border hover:bg-muted/80"
                )}
              >
                <span>{r.emoji}</span>
                {r.count > 1 && <span className="text-[10px] font-medium">{r.count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp + Status (only on group end) */}
        {message.isGroupEnd && (
          <div
            className={cn(
              "flex items-center gap-1 px-1",
              message.isOwn ? "flex-row-reverse" : "flex-row"
            )}
          >
            <span className="text-[10px] text-muted-foreground/70">
              {formatTime(message.timestamp)}
            </span>
            {message.isOwn && <StatusIcon status={message.status} />}
          </div>
        )}
      </div>
    </div>
  );
}