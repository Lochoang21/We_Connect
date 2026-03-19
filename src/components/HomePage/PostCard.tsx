/* eslint-disable @typescript-eslint/no-unused-vars */
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Send, X, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
// Helpers
// ---------------------------------------------------------------------------
function getTimeAgo(dateString: string): string {
  const secs = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (secs < 60) return "vừa xong"
  if (secs < 3600) return `${Math.floor(secs / 60)} phút`
  if (secs < 86400) return `${Math.floor(secs / 3600)} giờ`
  if (secs < 604800) return `${Math.floor(secs / 86400)} ngày`
  return new Date(dateString).toLocaleDateString("vi-VN")
}

// ===========================================================================
// CommentRow
// ===========================================================================
interface CommentRowProps {
  postId: string
  comment: CommentItem
  userId: string | null | undefined
  isAuthenticated: boolean
  authUser: { name?: string; image?: string | null } | null | undefined
  onDelete: (commentId: string) => void
  onReplyAdded: (reply: CommentItem) => void
}

function CommentRow({ postId, comment, userId, isAuthenticated, authUser, onDelete, onReplyAdded }: CommentRowProps) {
  const { toast } = useToast()

  const [isReplyOpen, setIsReplyOpen] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<ReplyItem[]>(comment.replies ?? [])
  const [repliesCount, setRepliesCount] = useState(comment.repliesCount ?? comment.replies?.length ?? 0)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setReplies(comment.replies ?? [])
    setRepliesCount(comment.repliesCount ?? comment.replies?.length ?? 0)
  }, [comment.replies, comment.repliesCount])

  useEffect(() => {
    if (isReplyOpen && replyInputRef.current) replyInputRef.current.focus()
  }, [isReplyOpen])

  const handleSubmitReply = useCallback(async () => {
    const trimmed = replyText.trim()
    if (!trimmed || isSubmitting) return

    if (!isAuthenticated) {
      toast({ title: "Vui lòng đăng nhập", variant: "destructive" })
      return
    }

    const optimisticReply: CommentItem = {
      id: `opt-reply-${Date.now()}`,
      user: { id: userId ?? "current-user", name: authUser?.name ?? "Bạn", image: authUser?.image ?? null },
      content: trimmed,
      createdAt: new Date().toISOString(),
      parentCommentId: comment.id,
    }

    onReplyAdded(optimisticReply)
    setReplyText("")
    setShowReplies(true)
    setIsSubmitting(true)

    try {
      await postService.commentOnPost(postId, trimmed, Number(comment.id))
    } catch (e: unknown) {
      setReplyText(trimmed)
      toast({ title: "Trả lời thất bại", description: e instanceof Error ? e.message : "Lỗi không xác định", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }, [replyText, isSubmitting, isAuthenticated, userId, authUser, toast, postId, comment.id, onReplyAdded])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitReply() }
  }

  const handleDeleteReply = (id: string) => {
    setReplies((p) => p.filter((r) => r.id !== id))
    setRepliesCount((p) => Math.max(0, p - 1))
  }

  return (
    <div className="group flex gap-3 py-3">
      {/* Avatar */}
      <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-background">
        <AvatarImage src={comment.user.image || "/placeholder.svg"} />
        <AvatarFallback className="text-xs font-medium bg-muted">{comment.user.name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Bubble */}
        <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-2.5 inline-block max-w-full">
          <span className="text-sm font-semibold block">{comment.user.name}</span>
          <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap break-words leading-relaxed">
            {comment.content}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-1.5 ml-1">
          <span className="text-[11px] text-muted-foreground">{getTimeAgo(comment.createdAt)}</span>

          <button
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => { setIsReplyOpen((p) => !p) }}
          >
            Trả lời
          </button>

          {repliesCount > 0 && (
            <button
              className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              onClick={() => setShowReplies((p) => !p)}
            >
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showReplies ? "rotate-180" : ""}`} />
              {repliesCount} trả lời
            </button>
          )}
        </div>

        {/* Replies thread */}
        {(showReplies || isReplyOpen) && (
          <div className="mt-3 ml-2 space-y-3">
            {/* Replies list */}
            {showReplies && replies.map((reply) => (
              <div key={reply.id} className="flex gap-2.5 group/reply">
                <Avatar className="w-6 h-6 flex-shrink-0 ring-2 ring-background">
                  <AvatarImage src={reply.user.image || "/placeholder.svg"} />
                  <AvatarFallback className="text-[10px] bg-muted">{reply.user.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-3 py-2 inline-block max-w-full">
                    <span className="text-xs font-semibold block">{reply.user.name}</span>
                    <p className="text-xs text-foreground/80 mt-0.5 whitespace-pre-wrap break-words leading-relaxed">
                      {reply.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-1">
                    <span className="text-[10px] text-muted-foreground">{getTimeAgo(reply.createdAt)}</span>
                  </div>
                </div>

                {reply.user.id === userId && (
                  <button
                    className="opacity-0 group-hover/reply:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
                    onClick={() => handleDeleteReply(reply.id)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Reply input */}
            {isReplyOpen && (
              <div className="flex items-end gap-2.5">
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarImage src={authUser?.image || "/placeholder.svg"} />
                  <AvatarFallback className="text-[10px] bg-muted">{authUser?.name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>

                <div className="flex-1 flex items-end gap-2 bg-background border border-border rounded-2xl px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <textarea
                    ref={replyInputRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={`Trả lời ${comment.user.name}…`}
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-xs leading-5 placeholder:text-muted-foreground focus:outline-none"
                    style={{ maxHeight: 72 }}
                  />
                  <button
                    className="text-primary disabled:text-muted-foreground/40 transition-colors flex-shrink-0"
                    disabled={!replyText.trim() || isSubmitting}
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

      {/* Delete own comment */}
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

// ===========================================================================
// PostCard
// ===========================================================================
export function PostCard({ post }: PostCardProps) {
  const userId = useAppSelector((state) => state.auth.user?.id)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const authUser = useAppSelector((state) => state.auth.user)
  const { toast } = useToast()

  const [isLiked, setIsLiked] = useState<boolean>(post.isLiked ?? false)
  const [likesCount, setLikesCount] = useState<number>(post.likesCount ?? 0)
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)

  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [comments, setComments] = useState<CommentItem[]>(post.comments ?? [])
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? post.comments?.length ?? 0)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (isCommentOpen && textareaRef.current) textareaRef.current.focus()
  }, [isCommentOpen])

  // ── like ──
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({ title: "Vui lòng đăng nhập để thích bài viết", variant: "destructive" })
      return
    }
    setIsLikeAnimating(true)
    setTimeout(() => setIsLikeAnimating(false), 300)

    if (!isLiked) {
      setIsLiked(true); setLikesCount((p) => p + 1)
      try { await postService.likePost(post.id) }
      catch (e: unknown) {
        setIsLiked(false); setLikesCount((p) => Math.max(0, p - 1))
        toast({ title: "Thích thất bại", variant: "destructive" })
      }
    } else {
      setIsLiked(false); setLikesCount((p) => Math.max(0, p - 1))
      try { await postService.unlikePost(post.id) }
      catch (e: unknown) {
        setIsLiked(true); setLikesCount((p) => p + 1)
        toast({ title: "Bỏ thích thất bại", variant: "destructive" })
      }
    }
  }

  // ── comment ──
  const handleSubmitComment = async () => {
    const trimmed = commentText.trim()
    if (!trimmed || isSubmitting) return
    if (!isAuthenticated) {
      toast({ title: "Vui lòng đăng nhập để bình luận", variant: "destructive" })
      return
    }

    const optimistic: CommentItem = {
      id: `opt-comment-${Date.now()}`,
      user: { id: userId ?? "current-user", name: authUser?.name ?? "Bạn", image: authUser?.image ?? null },
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
      await postService.commentOnPost(post.id, trimmed)
    } catch (e: unknown) {
      setComments((p) => p.filter((c) => c.id !== optimistic.id))
      setCommentsCount((p) => Math.max(0, p - 1))
      setCommentText(trimmed)
      toast({ title: "Bình luận thất bại", variant: "destructive" })
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
  }

  const handleReplyAdded = (reply: CommentItem) => {
    setComments((p) => [...p, reply])
  }

  // Organize comment hierarchy
  const organizedComments = comments.reduce<CommentItem[]>((acc, comment) => {
    if (!comment.parentCommentId) {
      const replies = comments
        .filter((c) => String(c.parentCommentId) === String(comment.id))
        .map((reply) => ({
          id: reply.id,
          user: reply.user,
          content: reply.content,
          createdAt: reply.createdAt,
        }))
      acc.push({ ...comment, replies, repliesCount: replies.length })
    }
    return acc
  }, [])

  // ── render ──
  return (
    <article className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10 ring-2 ring-border">
              <AvatarImage src={post.user.image || "/placeholder.svg"} />
              <AvatarFallback className="font-semibold text-sm bg-muted">{post.user.name[0]}</AvatarFallback>
            </Avatar>
            {/* Online indicator – optional, remove if no status */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-card" />
          </div>

          <div>
            <p className="font-semibold text-sm leading-tight">{post.user.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{getTimeAgo(post.createdAt)} trước</p>
          </div>
        </div>

        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* ── Media ──────────────────────────────────────────────────── */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="overflow-hidden">
          {post.mediaUrls.length === 1 && (
            <img
              src={post.mediaUrls[0]}
              alt="Post image"
              className="w-full max-h-[520px] object-cover"
            />
          )}
          {post.mediaUrls.length === 2 && (
            <div className="grid grid-cols-2 gap-0.5">
              {post.mediaUrls.map((u, i) => (
                <img key={i} src={u} alt={`Post image ${i + 1}`} className="w-full h-[280px] object-cover" />
              ))}
            </div>
          )}
          {post.mediaUrls.length === 3 && (
            <div className="grid grid-cols-3 gap-0.5">
              <img src={post.mediaUrls[0]} alt="Post image 1" className="col-span-2 w-full h-[300px] object-cover" />
              <div className="flex flex-col gap-0.5">
                <img src={post.mediaUrls[1]} alt="Post image 2" className="w-full flex-1 object-cover" style={{ height: "149px" }} />
                <img src={post.mediaUrls[2]} alt="Post image 3" className="w-full flex-1 object-cover" style={{ height: "149px" }} />
              </div>
            </div>
          )}
          {post.mediaUrls.length === 4 && (
            <div className="grid grid-cols-2 gap-0.5">
              {post.mediaUrls.map((u, i) => (
                <img key={i} src={u} alt={`Post image ${i + 1}`} className="w-full h-[220px] object-cover" />
              ))}
            </div>
          )}
          {post.mediaUrls.length >= 5 && (
            <div className="grid grid-cols-3 gap-0.5">
              {post.mediaUrls.slice(0, 5).map((u, i) => (
                <div key={i} className={`relative ${i === 0 ? "col-span-2 row-span-1" : ""}`}>
                  <img src={u} alt={`Post image ${i + 1}`} className="w-full h-[200px] object-cover" />
                  {i === 4 && post.mediaUrls.length > 5 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center backdrop-blur-[1px]">
                      <span className="text-white text-xl font-bold">+{post.mediaUrls.length - 5}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Stats row ──────────────────────────────────────────────── */}
      {(likesCount > 0 || commentsCount > 0) && (
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-1.5">
            {likesCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <Heart className="w-3 h-3 fill-white text-white" />
                </div>
                <span className="text-xs text-muted-foreground">{likesCount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {commentsCount > 0 && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
              onClick={() => setIsCommentOpen((p) => !p)}
            >
              {commentsCount.toLocaleString()} bình luận
            </button>
          )}
        </div>
      )}

      {/* ── Action bar ─────────────────────────────────────────────── */}
      <div className="mx-4 py-1.5 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Like */}
            <button
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 select-none
                ${isLiked
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              onClick={handleLike}
            >
              <Heart
                className={`w-4.5 h-4.5 transition-all duration-150 ${isLiked ? "fill-red-500 scale-110" : ""} ${isLikeAnimating ? "scale-125" : ""}`}
              />
              <span>Thích</span>
            </button>

            {/* Comment */}
            <button
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors select-none
                ${isCommentOpen
                  ? "text-primary hover:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              onClick={() => setIsCommentOpen((p) => !p)}
            >
              <MessageCircle className={`w-4.5 h-4.5 ${isCommentOpen ? "fill-primary/20" : ""}`} />
              <span>Bình luận</span>
            </button>

            {/* Share */}
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors">
              <Share2 className="w-4.5 h-4.5" />
              <span>Chia sẻ</span>
            </button>
          </div>

          {/* Save */}
          <button
            className={`p-2 rounded-xl transition-colors ${isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/70"}`}
            onClick={() => setIsSaved((p) => !p)}
          >
            <Bookmark className={`w-4.5 h-4.5 ${isSaved ? "fill-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Comment Panel ──────────────────────────────────────────── */}
      {isCommentOpen && (
        <div className="border-t border-border/60">
          {/* Composer */}
          <div className="flex items-end gap-3 px-4 py-3">
            <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-border">
              <AvatarImage src={authUser?.image || "/placeholder.svg"} />
              <AvatarFallback className="text-xs font-medium bg-muted">{authUser?.name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>

            <div className="flex-1 flex items-end gap-2 bg-muted/60 border border-border/60 rounded-2xl px-4 py-2.5 focus-within:border-primary/50 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
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
              <button
                className="text-primary disabled:text-muted-foreground/30 transition-colors flex-shrink-0 disabled:cursor-not-allowed"
                disabled={!commentText.trim() || isSubmitting}
                onClick={handleSubmitComment}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comment list */}
          <div className="max-h-[480px] overflow-y-auto px-4 pb-3 divide-y divide-border/30">
            {organizedComments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Chưa có bình luận nào.</p>
                <p className="text-xs text-muted-foreground">Hãy là người đầu tiên!</p>
              </div>
            ) : (
              organizedComments.map((c) => (
                <CommentRow
                  key={c.id}
                  postId={post.id}
                  comment={c}
                  userId={userId}
                  isAuthenticated={isAuthenticated}
                  authUser={authUser}
                  onDelete={handleDeleteComment}
                  onReplyAdded={handleReplyAdded}
                />
              ))
            )}
          </div>
        </div>
      )}
    </article>
  )
}