import { Send, X, ChevronDown as ChDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCallback, useEffect, useRef, useState } from "react"
import type { CommentItem, ProfileUser, ReplyItem } from "@/components/Profiles/types"
import { timeAgo } from "@/components/Profiles/utils"

interface ProfileCommentRowProps {
  comment: CommentItem
  userId?: string
  authUser?: ProfileUser | null
  onDelete: (id: string) => void
  onReplyAdded: (reply: CommentItem) => void
}

export function ProfileCommentRow({ comment, userId, authUser, onDelete, onReplyAdded }: ProfileCommentRowProps) {
  const [isReplyOpen, setIsReplyOpen] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<ReplyItem[]>(comment.replies ?? [])
  const [repliesCount, setRepliesCount] = useState(comment.repliesCount ?? comment.replies?.length ?? 0)
  const [replyText, setReplyText] = useState("")
  const replyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isReplyOpen) replyRef.current?.focus()
  }, [isReplyOpen])

  const handleSubmitReply = useCallback(() => {
    const trimmed = replyText.trim()
    if (!trimmed || !userId) return
    const optimistic: CommentItem = {
      id: `opt-reply-${Date.now()}`,
      user: { id: userId, name: authUser?.name ?? "Bạn", image: authUser?.image ?? null },
      content: trimmed,
      createdAt: new Date().toISOString(),
      parentCommentId: comment.id,
    }
    onReplyAdded(optimistic)
    setReplyText("")
    setShowReplies(true)
  }, [replyText, userId, authUser, comment.id, onReplyAdded])

  return (
    <div className="group flex gap-3 py-2.5">
      <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-background mt-0.5">
        <AvatarImage src={comment.user.image || "/placeholder.svg"} />
        <AvatarFallback className="text-xs font-medium bg-muted">{comment.user.name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-2.5 inline-block max-w-full">
          <span className="text-sm font-semibold block">{comment.user.name}</span>
          <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap break-words leading-relaxed">{comment.content}</p>
        </div>

        <div className="flex items-center gap-4 mt-1.5 ml-1">
          <span className="text-[11px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          <button
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsReplyOpen((p) => !p)}
          >
            Trả lời
          </button>
          {repliesCount > 0 && (
            <button
              className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
              onClick={() => setShowReplies((p) => !p)}
            >
              <ChDown className={`w-3 h-3 transition-transform duration-200 ${showReplies ? "rotate-180" : ""}`} />
              {repliesCount} trả lời
            </button>
          )}
        </div>

        {(showReplies || isReplyOpen) && (
          <div className="mt-2.5 ml-2 space-y-2.5">
            {showReplies && replies.map((reply) => (
              <div key={reply.id} className="flex gap-2.5 group/reply">
                <Avatar className="w-6 h-6 flex-shrink-0 ring-2 ring-background mt-0.5">
                  <AvatarImage src={reply.user.image || "/placeholder.svg"} />
                  <AvatarFallback className="text-[10px] bg-muted">{reply.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-3 py-2 inline-block max-w-full">
                    <span className="text-xs font-semibold block">{reply.user.name}</span>
                    <p className="text-xs text-foreground/80 mt-0.5 whitespace-pre-wrap break-words leading-relaxed">{reply.content}</p>
                  </div>
                  <span className="block text-[10px] text-muted-foreground mt-1 ml-1">{timeAgo(reply.createdAt)}</span>
                </div>
                {reply.user.id === userId && (
                  <button
                    className="opacity-0 group-hover/reply:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
                    onClick={() => {
                      setReplies((p) => p.filter((r) => r.id !== reply.id))
                      setRepliesCount((p) => Math.max(0, p - 1))
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {isReplyOpen && (
              <div className="flex items-end gap-2.5">
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarImage src={authUser?.image || "/placeholder.svg"} />
                  <AvatarFallback className="text-[10px] bg-muted">{authUser?.name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-end gap-2 bg-background border border-border/60 rounded-2xl px-3 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <textarea
                    ref={replyRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmitReply()
                      }
                    }}
                    placeholder={`Trả lời ${comment.user.name}…`}
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-xs leading-5 placeholder:text-muted-foreground focus:outline-none"
                    style={{ maxHeight: 72 }}
                  />
                  <button
                    className="text-primary disabled:text-muted-foreground/30 flex-shrink-0"
                    disabled={!replyText.trim()}
                    onClick={handleSubmitReply}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {comment.user.id === userId && (
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 flex-shrink-0 mt-1"
          onClick={() => onDelete(comment.id)}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
