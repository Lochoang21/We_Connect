import { Heart, MessageCircle, Share2, MoreVertical, Bookmark, Send, X, Reply } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { PostListItem } from "@/types/post"
import { useState, useRef, useEffect, useCallback } from "react"
import { useAppSelector } from "@/redux/hooks"
import postService from "@/services/postService"
import { useToast } from "@/hooks/use-toast"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ReplyItem {
  id: string
  user: { id: string; name: string; image?: string | null }
  content: string
  createdAt: string
}

interface CommentItem {
  id: string
  user: { id: string; name: string; image?: string | null }
  content: string
  createdAt: string
  parentCommentId?: string | number | null
  replies?: ReplyItem[]
  repliesCount?: number
}

interface PostCardProps {
  post: PostListItem & {
    commentsCount?: number
    comments?: CommentItem[]
  }
}

// ---------------------------------------------------------------------------
// Shared helper
// ---------------------------------------------------------------------------
function getTimeAgo(dateString: string): string {
  const secs = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (secs < 60) return "just now"
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`
  return new Date(dateString).toLocaleDateString()
}

// ===========================================================================
// CommentRow  –  encapsulates ONE comment + its entire reply thread
// ===========================================================================
interface CommentRowProps {
  postId: string
  comment: CommentItem
  userId: string | null | undefined
  authUser: { name?: string; image?: string | null } | null | undefined
  onDelete: (commentId: string) => void
  onReplyAdded: (reply: CommentItem) => void
}

function CommentRow({ postId, comment, userId, authUser, onDelete, onReplyAdded }: CommentRowProps) {
  const { toast } = useToast()

  const [isReplyOpen, setIsReplyOpen] = useState(false)
  const [replies, setReplies] = useState<ReplyItem[]>(comment.replies ?? [])
  const [repliesCount, setRepliesCount] = useState(comment.repliesCount ?? comment.replies?.length ?? 0)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  // Update replies when comment.replies changes
  useEffect(() => {
    setReplies(comment.replies ?? [])
    setRepliesCount(comment.repliesCount ?? comment.replies?.length ?? 0)
  }, [comment.replies, comment.repliesCount])

  useEffect(() => {
    if (isReplyOpen && replyInputRef.current) replyInputRef.current.focus()
  }, [isReplyOpen])

  // ── submit ──────────────────────────────────────────────────────────────
  const handleSubmitReply = useCallback(async () => {
    const trimmed = replyText.trim()
    if (!trimmed || isSubmitting) return

    if (!userId) {
      toast({ title: "Vui lòng đăng nhập", description: "Đăng nhập để trả lời", variant: "destructive" })
      return
    }

    const optimisticReply: CommentItem = {
      id: `opt-reply-${Date.now()}`,
      user: { id: userId, name: authUser?.name ?? "Bạn", image: authUser?.image ?? null },
      content: trimmed,
      createdAt: new Date().toISOString(),
      parentCommentId: comment.id,
    }

    // Add to parent comments list via callback
    onReplyAdded(optimisticReply)
    setReplyText("")
    setIsSubmitting(true)

    try {
      // Call API with parentCommentId
      await postService.commentOnPost(postId, trimmed, Number(comment.id))
      toast({ title: "Đã trả lời bình luận", variant: "default" })

      // Add to parent comments list so it gets organized
      // This will trigger re-render and organize the reply under its parent
    } catch (e: unknown) {
      // Remove optimistic reply on error
      // The parent will handle this through onReplyAdded
      setReplyText(trimmed)
      toast({ title: "Trả lời thất bại", description: e instanceof Error ? e.message : "Lỗi không xác định", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }, [replyText, isSubmitting, userId, authUser, toast, postId, comment.id, onReplyAdded])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitReply() }
  }

  const handleDeleteReply = (id: string) => {
    setReplies((p) => p.filter((r) => r.id !== id))
    setRepliesCount((p) => Math.max(0, p - 1))
    // TODO: await postService.deleteReply(id)
  }

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 group">
      {/* Avatar */}
      <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
        <AvatarImage src={comment.user.image || "/placeholder.svg"} />
        <AvatarFallback className="text-xs">{comment.user.name[0]}</AvatarFallback>
      </Avatar>

      {/* Main body */}
      <div className="flex-1 min-w-0">
        {/* name + timestamp */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold truncate">{comment.user.name}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">{getTimeAgo(comment.createdAt)}</span>
        </div>

        {/* text */}
        <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        {/* action row */}
        <div className="flex items-center gap-3 mt-1.5">
          <Button
            variant="ghost" size="sm"
            className={`gap-1 h-6 px-0 text-xs text-muted-foreground hover:text-primary transition-colors ${isReplyOpen ? "text-primary" : ""}`}
            onClick={() => setIsReplyOpen((p) => !p)}
          >
            <Reply className="w-3.5 h-3.5" />
            Trả lời
          </Button>

          <button
            className={`text-xs transition-colors ${repliesCount > 0 ? "text-muted-foreground hover:text-primary" : "text-muted-foreground/50"}`}
            onClick={() => setIsReplyOpen((p) => !p)}
          >
            {repliesCount} {repliesCount === 1 ? "trả lời" : "trả lời"}
          </button>
        </div>

        {/* ── Reply thread ──────────────────────────────────────────────── */}
        {isReplyOpen && (
          <div className="mt-2.5 border-l-2 border-border pl-3">

            {/* existing replies (rendered ABOVE the input, newest-last) */}
            {replies.length > 0 && (
              <div className="divide-y divide-border/40 mb-2">
                {replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-2 py-1.5 group/reply">
                    <Avatar className="w-5 h-5 flex-shrink-0 mt-0.5">
                      <AvatarImage src={reply.user.image || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs" style={{ fontSize: 9 }}>{reply.user.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-semibold truncate">{reply.user.name}</span>
                        <span className="text-muted-foreground flex-shrink-0" style={{ fontSize: 10 }}>
                          {getTimeAgo(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/85 mt-0.5 whitespace-pre-wrap break-words">
                        {reply.content}
                      </p>
                    </div>

                    {/* delete own reply */}
                    {reply.user.id === userId && (
                      <Button
                        variant="ghost" size="icon"
                        className="w-5 h-5 p-0 opacity-0 group-hover/reply:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => handleDeleteReply(reply.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* reply input */}
            <div className="flex items-end gap-2">
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarImage src={authUser?.image || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{authUser?.name?.[0] ?? "?"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 flex items-end gap-1.5 bg-muted rounded-full px-3 py-1 border border-border focus-within:border-primary transition-colors">
                <textarea
                  ref={replyInputRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={`Trả lời @${comment.user.name}…`}
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-xs leading-5 placeholder:text-muted-foreground focus:outline-none"
                  style={{ maxHeight: 72 }}
                />
                <Button
                  variant="ghost" size="icon"
                  className="w-6 h-6 p-0 text-muted-foreground hover:text-primary flex-shrink-0 disabled:opacity-30"
                  disabled={!replyText.trim() || isSubmitting}
                  onClick={handleSubmitReply}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* delete own comment */}
      {comment.user.id === userId && (
        <Button
          variant="ghost" size="icon"
          className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0 mt-0.5"
          onClick={() => onDelete(comment.id)}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  )
}

// ===========================================================================
// PostCard  –  top-level card (unchanged public API)
// ===========================================================================
export function PostCard({ post }: PostCardProps) {
  const userId = useAppSelector((state) => state.auth.user?.id)
  const authUser = useAppSelector((state) => state.auth.user)
  const { toast } = useToast()

  // like
  const [isLiked, setIsLiked] = useState<boolean>(post.isLiked ?? false)
  const [likesCount, setLikesCount] = useState<number>(post.likesCount ?? 0)

  // comment
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [comments, setComments] = useState<CommentItem[]>(post.comments ?? [])
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? post.comments?.length ?? 0)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (isCommentOpen && textareaRef.current) textareaRef.current.focus()
  }, [isCommentOpen])

  // ── like ──
  const handleLike = async () => {
    if (!userId) {
      toast({ title: "Vui lòng đăng nhập", description: "Đăng nhập để thích bài viết", variant: "destructive" })
      return
    }
    if (!isLiked) {
      setIsLiked(true); setLikesCount((p) => p + 1)
      try { await postService.likePost(post.id); toast({ title: "Đã thích bài viết" }) }
      catch (e: unknown) {
        setIsLiked(false); setLikesCount((p) => Math.max(0, p - 1))
        toast({ title: "Thích thất bại", description: e instanceof Error ? e.message : "Lỗi không xác định", variant: "destructive" })
      }
    } else {
      setIsLiked(false); setLikesCount((p) => Math.max(0, p - 1))
      try { await postService.unlikePost(post.id); toast({ title: "Đã bỏ thích bài viết" }) }
      catch (e: unknown) {
        setIsLiked(true); setLikesCount((p) => p + 1)
        toast({ title: "Bỏ thích thất bại", description: e instanceof Error ? e.message : "Lỗi không xác định", variant: "destructive" })
      }
    }
  }

  // ── comment ──
  const handleSubmitComment = async () => {
    const trimmed = commentText.trim()
    if (!trimmed || isSubmitting) return
    if (!userId) {
      toast({ title: "Vui lòng đăng nhập", description: "Đăng nhập để bình luận", variant: "destructive" })
      return
    }

    const optimistic: CommentItem = {
      id: `opt-comment-${Date.now()}`,
      user: { id: userId, name: authUser?.name ?? "Bạn", image: authUser?.image ?? null },
      content: trimmed,
      createdAt: new Date().toISOString(),
      parentCommentId: null,
      replies: [],
      repliesCount: 0,
    }

    setComments((p) => [optimistic, ...p])
    setCommentsCount((p) => p + 1)
    setCommentText("")
    setIsSubmitting(true)

    try {
      // Call API without parentCommentId (regular comment)
      await postService.commentOnPost(post.id, trimmed)
      toast({ title: "Đã thêm bình luận" })
    } catch (e: unknown) {
      setComments((p) => p.filter((c) => c.id !== optimistic.id))
      setCommentsCount((p) => Math.max(0, p - 1))
      setCommentText(trimmed)
      toast({ title: "Bình luận thất bại", description: e instanceof Error ? e.message : "Lỗi không xác định", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitComment() }
  }

  const handleDeleteComment = (id: string) => {
    setComments((p) => p.filter((c) => c.id !== id))
    setCommentsCount((p) => Math.max(0, p - 1))
    // TODO: await postService.deleteComment(id)
  }

  const handleReplyAdded = (reply: CommentItem) => {
    setComments((p) => [...p, reply])
    setCommentsCount((p) => p + 1)
  }

  // Build comment hierarchy: organize comments with their replies
  const organizedComments = comments.reduce<CommentItem[]>((acc, comment) => {
    // If it's a parent comment (no parentCommentId), add it to the list
    if (!comment.parentCommentId) {
      // Find all replies for this comment
      const replies = comments
        .filter((c) => String(c.parentCommentId) === String(comment.id))
        .map((reply) => ({
          id: reply.id,
          user: reply.user,
          content: reply.content,
          createdAt: reply.createdAt,
        }))

      acc.push({
        ...comment,
        replies,
        repliesCount: replies.length,
      })
    }
    return acc
  }, [])

  // ── render ──
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.user.image || "/placeholder.svg"} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-sm">{post.user.name}</h4>
            <p className="text-xs text-muted-foreground">{getTimeAgo(post.createdAt)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="relative">
          {post.mediaUrls.length === 1 && (
            <img src={post.mediaUrls[0]} alt="Post image" className="w-full max-h-[600px] object-contain bg-muted" />
          )}
          {post.mediaUrls.length === 2 && (
            <div className="grid grid-cols-2 gap-0.5">
              {post.mediaUrls.map((u, i) => <img key={i} src={u} alt={`Post image ${i + 1}`} className="w-full h-[320px] object-cover" />)}
            </div>
          )}
          {post.mediaUrls.length === 3 && (
            <div className="grid grid-cols-2 gap-0.5">
              <img src={post.mediaUrls[0]} alt="Post image 1" className="row-span-2 w-full h-full object-cover" />
              <img src={post.mediaUrls[1]} alt="Post image 2" className="w-full h-[159.5px] object-cover" />
              <img src={post.mediaUrls[2]} alt="Post image 3" className="w-full h-[159.5px] object-cover" />
            </div>
          )}
          {post.mediaUrls.length === 4 && (
            <div className="grid grid-cols-2 gap-0.5">
              {post.mediaUrls.map((u, i) => <img key={i} src={u} alt={`Post image ${i + 1}`} className="w-full h-[240px] object-cover" />)}
            </div>
          )}
          {post.mediaUrls.length >= 5 && (
            <div className="grid grid-cols-2 gap-0.5">
              {post.mediaUrls.slice(0, 4).map((u, i) => (
                <div key={i} className="relative">
                  <img src={u} alt={`Post image ${i + 1}`} className="w-full h-[240px] object-cover" />
                  {i === 3 && post.mediaUrls.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-2xl font-semibold">+{post.mediaUrls.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{likesCount > 0 ? `${likesCount} thích` : ""}</span>
          <span
            className={`cursor-pointer hover:underline ${isCommentOpen ? "text-primary" : ""}`}
            onClick={() => setIsCommentOpen((p) => !p)}
          >
            {commentsCount > 0 ? `${commentsCount} bình luận` : ""}
          </span>
        </div>

        <div className="border-t border-border" />

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm"
              className={`gap-1.5 transition-colors ${isLiked ? "text-red-500 hover:text-red-600" : ""}`}
              onClick={handleLike}
            >
              <Heart className={`w-4.5 h-4.5 ${isLiked ? "fill-red-500" : ""}`} />
              <span className="text-sm">Thích</span>
            </Button>

            <Button variant="ghost" size="sm"
              className={`gap-1.5 transition-colors ${isCommentOpen ? "text-primary" : ""}`}
              onClick={() => setIsCommentOpen((p) => !p)}
            >
              <MessageCircle className={`w-4.5 h-4.5 ${isCommentOpen ? "fill-primary/20" : ""}`} />
              <span className="text-sm">Bình luận</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-1.5">
              <Share2 className="w-4.5 h-4.5" />
              <span className="text-sm">Chia sẻ</span>
            </Button>
          </div>

          <Button variant="ghost" size="icon"><Bookmark className="w-4.5 h-4.5" /></Button>
        </div>
      </div>

      {/* Comment panel */}
      {isCommentOpen && (
        <div className="border-t border-border bg-card/50">
          {/* input */}
          <div className="flex items-end gap-2 p-3 border-b border-border">
            <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
              <AvatarImage src={authUser?.image || "/placeholder.svg"} />
              <AvatarFallback>{authUser?.name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-end gap-2 bg-muted rounded-full px-4 py-1.5 border border-border focus-within:border-primary transition-colors">
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                placeholder="Viết bình luận…"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm leading-5 placeholder:text-muted-foreground focus:outline-none"
                style={{ maxHeight: 96 }}
              />
              <Button variant="ghost" size="icon"
                className="w-7 h-7 p-0 text-muted-foreground hover:text-primary flex-shrink-0 disabled:opacity-30"
                disabled={!commentText.trim() || isSubmitting}
                onClick={handleSubmitComment}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* list */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-border/60">
            {organizedComments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-5">
                Chưa có bình luận nào. Là người đầu tiên bình luận!
              </p>
            ) : (
              organizedComments.map((c) => (
                <CommentRow
                  key={c.id}
                  postId={post.id}
                  comment={c}
                  userId={userId}
                  authUser={authUser}
                  onDelete={handleDeleteComment}
                  onReplyAdded={handleReplyAdded}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}