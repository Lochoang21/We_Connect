import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send, Share2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useRef, useState } from "react"
import { ProfileCommentRow } from "@/components/Profiles/ProfileCommentRow"
import type { CommentItem, PostItem, ProfileUser } from "@/components/Profiles/types"
import { timeAgo } from "@/components/Profiles/utils"
import postService from "@/services/postService"
import { useToast } from "@/hooks/use-toast"

interface ProfilePostCardProps {
  post: PostItem
  currentUserId: string
  currentUser: ProfileUser
}

export function ProfilePostCard({ post, currentUserId, currentUser }: ProfilePostCardProps) {
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false)
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0)
  const [isLikeAnim, setIsLikeAnim] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [comments, setComments] = useState<CommentItem[]>(post.comments ?? [])
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? 0)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isCommentOpen) textareaRef.current?.focus()
  }, [isCommentOpen])

  useEffect(() => {
    setIsLiked(post.isLiked ?? false)
    setLikesCount(post.likesCount ?? 0)
  }, [post.id, post.isLiked, post.likesCount])

  const MAX_CONTENT_LEN = 180

  const handleLike = async () => {
    if (!currentUserId) {
      toast({ title: "Vui long dang nhap de thich bai viet", variant: "destructive" })
      return
    }

    if (isLiking) return

    setIsLikeAnim(true)
    setTimeout(() => setIsLikeAnim(false), 300)

    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)))
    setIsLiking(true)

    try {
      if (nextLiked) {
        await postService.likePost(post.id)
      } else {
        await postService.unlikePost(post.id)
      }
    } catch {
      setIsLiked(!nextLiked)
      setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)))
      toast({ title: nextLiked ? "Thich that bai" : "Bo thich that bai", variant: "destructive" })
    } finally {
      setIsLiking(false)
    }
  }

  const handleSubmitComment = () => {
    const trimmed = commentText.trim()
    if (!trimmed || isSubmitting) return
    const optimistic: CommentItem = {
      id: `opt-${Date.now()}`,
      user: currentUser,
      content: trimmed,
      createdAt: new Date().toISOString(),
      parentCommentId: null,
      replies: [],
      repliesCount: 0,
    }
    setComments((p) => [optimistic, ...p])
    setCommentsCount((p) => p + 1)
    setCommentText("")
  }

  const handleDeleteComment = (id: string) => {
    setComments((p) => p.filter((c) => c.id !== id))
    setCommentsCount((p) => Math.max(0, p - 1))
  }

  const handleReplyAdded = (reply: CommentItem) => {
    setComments((p) => [...p, reply])
  }

  const organizedComments = comments.reduce<CommentItem[]>((acc, comment) => {
    if (!comment.parentCommentId) {
      const replies = comments
        .filter((c) => String(c.parentCommentId) === String(comment.id))
        .map(({ id, user, content, createdAt }) => ({ id, user, content, createdAt }))
      acc.push({ ...comment, replies, repliesCount: replies.length })
    }
    return acc
  }, [])

  const content = post.content ?? ""
  const isLong = content.length > MAX_CONTENT_LEN
  const displayContent = isLong && !expanded ? `${content.slice(0, MAX_CONTENT_LEN)}…` : content

  return (
    <article className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10 ring-2 ring-border">
              <AvatarImage src={post.user.image || "/placeholder.svg"} />
              <AvatarFallback className="font-semibold text-sm bg-muted">{post.user.name[0]}</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-card" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">{post.user.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="w-4.5 h-4.5" />
        </button>
      </div>

      {content && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{displayContent}</p>
          {isLong && (
            <button
              className="text-sm text-primary font-medium mt-0.5 hover:underline"
              onClick={() => setExpanded((p) => !p)}
            >
              {expanded ? "Thu gọn" : "Xem thêm"}
            </button>
          )}
        </div>
      )}

      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="overflow-hidden">
          {post.mediaUrls.length === 1 && <img src={post.mediaUrls[0]} alt="Post" className="w-full max-h-[520px] object-cover" />}
          {post.mediaUrls.length === 2 && (
            <div className="grid grid-cols-2 gap-0.5">
              {post.mediaUrls.map((u, i) => (
                <img key={i} src={u} alt="" className="w-full h-[280px] object-cover" />
              ))}
            </div>
          )}
          {post.mediaUrls.length >= 3 && (
            <div className="grid grid-cols-3 gap-0.5">
              {post.mediaUrls.slice(0, 3).map((u, i) => (
                <div key={i} className="relative">
                  <img src={u} alt="" className="w-full h-[200px] object-cover" />
                  {i === 2 && post.mediaUrls!.length > 3 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">+{post.mediaUrls!.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(likesCount > 0 || commentsCount > 0) && (
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          {likesCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <Heart className="w-3 h-3 fill-white text-white" />
              </div>
              <span className="text-xs text-muted-foreground">{likesCount.toLocaleString()}</span>
            </div>
          ) : (
            <div />
          )}
          {commentsCount > 0 && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
              onClick={() => setIsCommentOpen((p) => !p)}
            >
              {commentsCount} bình luận
            </button>
          )}
        </div>
      )}

      <div className="mx-4 py-1 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 select-none
                ${isLiked ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/70"}`}
              onClick={handleLike}
            >
              <Heart className={`w-4.5 h-4.5 transition-all duration-150 ${isLiked ? "fill-red-500 scale-110" : ""} ${isLikeAnim ? "scale-125" : ""}`} />
              Thích
            </button>
            <button
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors select-none
                ${isCommentOpen ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/70"}`}
              onClick={() => setIsCommentOpen((p) => !p)}
            >
              <MessageCircle className={`w-4.5 h-4.5 ${isCommentOpen ? "fill-primary/20" : ""}`} />
              Bình luận
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors">
              <Share2 className="w-4.5 h-4.5" />
              Chia sẻ
            </button>
          </div>
          <button
            className={`p-2 rounded-xl transition-colors ${isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/70"}`}
            onClick={() => setIsSaved((p) => !p)}
          >
            <Bookmark className={`w-4.5 h-4.5 ${isSaved ? "fill-primary" : ""}`} />
          </button>
        </div>
      </div>

      {isCommentOpen && (
        <div className="border-t border-border/60">
          <div className="flex items-end gap-3 px-4 py-3">
            <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-border">
              <AvatarImage src={currentUser.image || "/placeholder.svg"} />
              <AvatarFallback className="text-xs font-medium bg-muted">{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-end gap-2 bg-muted/60 border border-border/60 rounded-2xl px-4 py-2.5 focus-within:border-primary/50 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment()
                  }
                }}
                placeholder="Viết bình luận…"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm leading-5 placeholder:text-muted-foreground focus:outline-none"
                style={{ maxHeight: 96 }}
              />
              <button
                className="text-primary disabled:text-muted-foreground/30 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
                disabled={!commentText.trim() || isSubmitting}
                onClick={handleSubmitComment}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto px-4 pb-3 divide-y divide-border/30">
            {organizedComments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Chưa có bình luận nào.</p>
                <p className="text-xs text-muted-foreground">Hãy là người đầu tiên!</p>
              </div>
            ) : (
              organizedComments.map((c) => (
                <ProfileCommentRow
                  key={c.id}
                  comment={c}
                  userId={currentUserId}
                  authUser={currentUser}
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
