import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ProfileFeed } from "@/components/Profiles/ProfileFeed"
import { ProfileHeader } from "@/components/Profiles/ProfileHeader"
import { ProfileSidebar } from "@/components/Profiles/ProfileSidebar"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchUserProfile } from "@/redux/slices/authSlice"
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  usePendingRequests,
  useSearchFriendsUsers,
  useSendFriendRequest,
  useUnfriend,
} from "@/hooks/useFriendsQuery"
import postService from "@/services/postService"
import userService from "@/services/userService"
import { tokenStorage } from "@/utils/tokenStorage"
import type { CommentResponse, MyPostListItem } from "@/types/post"
import type { PostItem } from "@/components/Profiles/types"
import type { User } from "@/types/auth"

export function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, status } = useAppSelector((state) => state.auth)
  const [myPosts, setMyPosts] = useState<MyPostListItem[]>([])
  const [authorPosts, setAuthorPosts] = useState<MyPostListItem[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [viewedUser, setViewedUser] = useState<User | null>(null)
  const [viewedUserLoading, setViewedUserLoading] = useState(false)
  const [viewedUserError, setViewedUserError] = useState<string | null>(null)

  const isViewingOtherUser = Boolean(id)
  const isOwnProfile = !id || id === user?.id
  const profileTargetId = Number(id)

  const sendMutation = useSendFriendRequest()
  const acceptMutation = useAcceptFriendRequest()
  const cancelMutation = useCancelFriendRequest()
  const unfriendMutation = useUnfriend()
  const { data: pendingData } = usePendingRequests({ current: 1, pageSize: 100 })

  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfile())
    }
  }, [dispatch, user])

  useEffect(() => {
    const fetchViewedUser = async () => {
      if (!id || id === user?.id) {
        setViewedUser(null)
        setViewedUserError(null)
        return
      }

      try {
        setViewedUserLoading(true)
        setViewedUserError(null)
        const profile = await userService.getUserById(id)
        setViewedUser(profile)
      } catch (error) {
        console.error("Load user profile by id failed:", error)
        setViewedUserError("Khong the tai thong tin nguoi dung.")
      } finally {
        setViewedUserLoading(false)
      }
    }

    fetchViewedUser()
  }, [id, user?.id])

  useEffect(() => {
    const fetchProfilePosts = async () => {
      if (!isOwnProfile && !id) {
        setAuthorPosts([])
        return
      }

      if (isOwnProfile && !user) {
        setMyPosts([])
        return
      }

      try {
        setPostsLoading(true)
        if (isOwnProfile) {
          const response = await postService.getMyPosts()
          setMyPosts(response.result)
          setAuthorPosts([])
        } else if (id) {
          const response = await postService.getPostsByAuthor(id)
          setAuthorPosts(response.result)
          setMyPosts([])
        }
      } catch (error) {
        console.error("Load profile posts failed:", error)
        setMyPosts([])
        setAuthorPosts([])
      } finally {
        setPostsLoading(false)
      }
    }

    fetchProfilePosts()
  }, [user, isOwnProfile, id])

  const profileUser = isOwnProfile ? user : viewedUser
  const viewerUserId = Number(user?.id ?? 0) || tokenStorage.getUserIdFromAccessToken() || null
  const hasIncomingPending = Boolean(
    !isOwnProfile &&
    viewedUser?.id &&
    (pendingData?.result ?? []).some((item) => Number(item.sender.id) === Number(viewedUser.id))
  )

  const relationshipQuery = useSearchFriendsUsers(
    {
      query: viewedUser?.email ?? viewedUser?.name ?? "",
      current: 1,
      pageSize: 20,
    },
    {
      enabled: Boolean(!isOwnProfile && viewedUser?.id),
    }
  )

  const profileRelationship = useMemo(() => {
    if (isOwnProfile || !id) {
      return null
    }

    return (
      relationshipQuery.data?.result?.find((item) => item.id === id)?.friendship ?? null
    )
  }, [isOwnProfile, id, relationshipQuery.data?.result])

  const profilePosts = useMemo<PostItem[]>(() => {
    const sourcePosts = isOwnProfile ? myPosts : authorPosts

    return sourcePosts.map((post) => ({
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
  }, [myPosts, authorPosts, isOwnProfile])

  if (isViewingOtherUser && viewedUserLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">Dang tai thong tin nguoi dung...</div>
      </div>
    )
  }

  if (isViewingOtherUser && viewedUserError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">{viewedUserError}</div>
      </div>
    )
  }

  if (!isViewingOtherUser && status === "loading" && !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">Đang tải thông tin cá nhân...</div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">Khong the tai thong tin nguoi dung.</div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <ProfileHeader
        user={profileUser}
        isOwn={isOwnProfile}
        relationship={profileRelationship}
        isRelationshipLoading={relationshipQuery.isLoading}
        currentUserId={viewerUserId}
        hasIncomingPending={hasIncomingPending}
        friendActions={{
          isSending: sendMutation.isPending,
          isAccepting: acceptMutation.isPending,
          isCancelling: cancelMutation.isPending,
          isUnfriending: unfriendMutation.isPending,
          onSend: () => {
            if (Number.isFinite(profileTargetId)) {
              sendMutation.mutate(profileTargetId)
            }
          },
          onAccept: () => {
            if (Number.isFinite(profileTargetId)) {
              acceptMutation.mutate(profileTargetId)
            }
          },
          onCancel: () => {
            if (Number.isFinite(profileTargetId)) {
              cancelMutation.mutate(profileTargetId)
            }
          },
          onUnfriend: () => {
            if (Number.isFinite(profileTargetId)) {
              unfriendMutation.mutate(profileTargetId)
            }
          },
          onMessage: () => {
            if (Number.isFinite(profileTargetId)) {
              navigate(`/messages/${profileTargetId}`)
            }
          },
        }}
      />

      <main className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <ProfileSidebar user={profileUser} />
          <div className="flex-1 min-w-0">
            {postsLoading ? (
              <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
                {isOwnProfile ? "Đang tải bài viết của bạn..." : "Đang tải bài viết của người dùng..."}
              </div>
            ) : (
              <ProfileFeed
                user={profileUser}
                posts={profilePosts}
                currentUserId={user?.id ?? ""}
                isOwn={isOwnProfile}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
