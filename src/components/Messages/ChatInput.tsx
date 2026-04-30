import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Nhập tin nhắn...",
  className,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasContent = value.trim().length > 0;

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();

    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping(false), 1500);
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue("");

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    if (onTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onTyping(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("p-3 border-t border-border bg-background", className)}>
      <div
        className={cn(
          "flex items-end gap-2 px-3 py-2 rounded-xl border bg-muted/40",
          "transition-all",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        {/* Attach */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          <Paperclip size={16} />
        </Button>

        {/* Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm outline-none",
            "placeholder:text-muted-foreground/60",
            "leading-relaxed py-1"
          )}
          style={{ maxHeight: "100px", overflowY: "auto" }}
        />

        {/* Emoji */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          <Smile size={16} />
        </Button>

        {/* Send */}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!hasContent}
          className={cn(
            "w-8 h-8 rounded-lg",
            hasContent
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Send size={15} />
        </Button>
      </div>
    </div>
  );
}