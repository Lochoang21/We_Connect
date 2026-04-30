import { useEffect, useRef, useMemo, useCallback } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { MessageBubble, type Message } from "./MessageBubble";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  /** True while loading older messages (cursor pagination) */
  isLoadingMore?: boolean;
  /** If true, there are older messages that can be loaded */
  hasMore?: boolean;
  /** Callback to load older messages */
  onLoadMore?: () => void;
  /** Show "X is typing..." indicator */
  typingUserName?: string | null;
  /** Contact name for displaying on incoming messages */
  contactName?: string;
  /** Contact avatar URL */
  contactAvatar?: string;
  className?: string;
}

/** Group consecutive messages by same sender and annotate isGroupStart/End */
function groupMessages(messages: Message[]): Message[] {
  return messages.map((msg, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];

    const sameSenderAsPrev = prev && prev.senderId === msg.senderId;
    const sameSenderAsNext = next && next.senderId === msg.senderId;

    // Also break groups if time gap > 5 minutes
    const timeGapPrev =
      prev && msg.timestamp.getTime() - prev.timestamp.getTime() > 5 * 60 * 1000;
    const timeGapNext =
      next && next.timestamp.getTime() - msg.timestamp.getTime() > 5 * 60 * 1000;

    return {
      ...msg,
      isGroupStart: !sameSenderAsPrev || timeGapPrev,
      isGroupEnd: !sameSenderAsNext || timeGapNext,
    };
  });
}

/** Format date for dividers */
function formatDateDivider(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - msgDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  return date.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });
}

function DateDivider({ date }: { date: Date }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-[11px] font-medium text-muted-foreground/70 shrink-0 px-2">
        {formatDateDivider(date)}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-muted animate-pulse shrink-0" />
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-[11px] text-muted-foreground px-1">{name}</span>
        <div className="bg-card border border-border/60 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                style={{ animationDelay: `${i * 150}ms`, animationDuration: "1s" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 select-none">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center text-primary/60 shadow-inner">
          <MessageSquare size={34} strokeWidth={1.5} />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary/20 border-2 border-background" />
        <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-primary/10 border-2 border-background" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">Bắt đầu cuộc trò chuyện</h3>
      <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
        Hãy gõ một tin nhắn để bắt đầu trò chuyện với người này.
      </p>
    </div>
  );
}

export function ChatMessages({
  messages,
  currentUserId,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  typingUserName,
  contactName,
  contactAvatar,
  className,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  // Auto-scroll to bottom on new messages (only if already near bottom)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isInitialLoadRef.current) {
      // On initial load, scroll instantly to bottom
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      isInitialLoadRef.current = false;
      return;
    }

    // If user is near the bottom (within 150px), auto-scroll
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 150) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUserName]);

  // Reset initial load flag when conversation changes
  useEffect(() => {
    isInitialLoadRef.current = true;
  }, [currentUserId]);

  // Restore scroll position after loading older messages
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isLoadingMore) return;

    // Save scroll height before older messages are prepended
    prevScrollHeightRef.current = container.scrollHeight;
  }, [isLoadingMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isLoadingMore || prevScrollHeightRef.current === 0) return;

    // After older messages render, maintain scroll position
    const newScrollHeight = container.scrollHeight;
    const diff = newScrollHeight - prevScrollHeightRef.current;
    if (diff > 0) {
      container.scrollTop += diff;
    }
    prevScrollHeightRef.current = 0;
  }, [messages, isLoadingMore]);

  // ── Scroll-to-top detection for cursor pagination ─────────────────────────
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isLoadingMore || !hasMore || !onLoadMore) return;

    if (container.scrollTop < 80) {
      onLoadMore();
    }
  }, [isLoadingMore, hasMore, onLoadMore]);

  const grouped = useMemo(() => groupMessages(messages), [messages]);

  // Build a list of items with date dividers
  const items = useMemo(() => {
    const result: Array<{ type: "divider"; date: Date } | { type: "message"; message: Message }> = [];
    let lastDate: string | null = null;

    for (const msg of grouped) {
      const dateKey = new Date(
        msg.timestamp.getFullYear(),
        msg.timestamp.getMonth(),
        msg.timestamp.getDate()
      ).toISOString();

      if (dateKey !== lastDate) {
        result.push({ type: "divider", date: msg.timestamp });
        lastDate = dateKey;
      }
      result.push({ type: "message", message: msg });
    }

    return result;
  }, [grouped]);

  if (isLoading) {
    return (
      <div className={cn("flex-1 overflow-y-auto px-6 py-4 space-y-3", className)}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex items-end gap-2",
              i % 3 === 0 ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className="w-7 h-7 rounded-full bg-muted animate-pulse shrink-0" />
            <div
              className="h-10 rounded-2xl bg-muted animate-pulse"
              style={{ width: `${80 + (i * 37) % 120}px` }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0 && !typingUserName) {
    return (
      <div className={cn("flex-1 flex flex-col overflow-hidden", className)}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn(
        "flex-1 overflow-y-auto px-6 py-4",
        "scroll-smooth",
        // Custom scrollbar
        "[&::-webkit-scrollbar]:w-1.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-border/60 [&::-webkit-scrollbar-thumb]:rounded-full",
        className
      )}
    >
      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-3">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {items.map((item, i) => {
        if (item.type === "divider") {
          return <DateDivider key={`divider-${i}`} date={item.date} />;
        }

        const msg = item.message;
        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            senderName={!msg.isOwn ? contactName : undefined}
            senderAvatar={!msg.isOwn ? contactAvatar : undefined}
          />
        );
      })}

      {typingUserName && <TypingIndicator name={typingUserName} />}

      <div ref={bottomRef} />
    </div>
  );
}
