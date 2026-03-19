import { useEffect, useMemo, useState } from "react"
import { ProfileFeed } from "@/components/Profiles/ProfileFeed"
import { ProfileHeader } from "@/components/Profiles/ProfileHeader"
import { ProfileSidebar } from "@/components/Profiles/ProfileSidebar"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchUserProfile } from "@/redux/slices/authSlice"
import postService from "@/services/postService"
import type { CommentResponse, MyPostListItem } from "@/types/post"
import type { PostItem } from "@/components/Profiles/types"

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const { user, status } = useAppSelector((state) => state.auth)
  const [myPosts, setMyPosts] = useState<MyPostListItem[]>([])
  const [postsLoading, setPostsLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfile())
    }
  }, [dispatch, user])

  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!user) return
      try {
        setPostsLoading(true)
        const response = await postService.getMyPosts()
        setMyPosts(response.result)
      } catch (error) {
        console.error("Load my posts failed:", error)
      } finally {
        setPostsLoading(false)
      }
    }

    fetchMyPosts()
  }, [user])

  const profilePosts = useMemo<PostItem[]>(() => {
    return myPosts.map((post) => ({
      id: post.id,
      user: {
        id: post.user.id,
        name: post.user.name,
        image: post.user.image,
      },
      content: post.content,
      mediaUrls: post.mediaUrls,
      createdAt: post.createdAt,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount ?? post.comments?.length ?? 0,
      isLiked: post.isLiked,
      comments: (post.comments ?? []).map((comment: CommentResponse) => ({
        id: comment.id,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          image: comment.user.image,
        },
        content: comment.content,
        createdAt: comment.createdAt,
        parentCommentId: comment.parentCommentId,
      })),
    }))
  }, [myPosts])

  if (status === "loading" && !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">Đang tải thông tin cá nhân...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">Không thể tải thông tin cá nhân.</div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <ProfileHeader user={user} isOwn={true} />

      <main className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <ProfileSidebar user={user} />
          <div className="flex-1 min-w-0">
            {postsLoading ? (
              <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">Đang tải bài viết của bạn...</div>
            ) : (
              <ProfileFeed user={user} posts={profilePosts} currentUserId={user.id} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
