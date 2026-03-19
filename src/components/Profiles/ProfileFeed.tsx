import type { PostItem, ProfileUser } from "@/components/Profiles/types"
import { ProfileComposer } from "@/components/Profiles/ProfileComposer"
import { ProfilePostCard } from "@/components/Profiles/ProfilePostCard"

interface ProfileFeedProps {
  user: ProfileUser
  posts: PostItem[]
  currentUserId: string
}

export function ProfileFeed({ user, posts, currentUserId }: ProfileFeedProps) {
  return (
    <div className="flex-1 min-w-0 space-y-3">
      <ProfileComposer user={user} />
      {posts.map((post) => (
        <ProfilePostCard key={post.id} post={post} currentUserId={currentUserId} currentUser={user} />
      ))}
    </div>
  )
}
