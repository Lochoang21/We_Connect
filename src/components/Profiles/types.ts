export interface ProfileUser {
  id: string
  email: string
  name: string
  image?: string | null
  coverImage?: string | null
  phone?: string | null
  address?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  bio?: string | null
}

export interface PhotoItem {
  id: string
  url: string
}

export interface ReplyItem {
  id: string
  user: { id: string; name: string; image?: string | null }
  content: string
  createdAt: string
}

export interface CommentItem {
  id: string
  user: { id: string; name: string; image?: string | null }
  content: string
  createdAt: string
  parentCommentId?: string | number | null
  replies?: ReplyItem[]
  repliesCount?: number
}

export interface PostItem {
  id: string
  user: { id: string; name: string; image?: string | null }
  content?: string
  mediaUrls?: string[]
  createdAt: string
  likesCount?: number
  commentsCount?: number
  isLiked?: boolean
  comments?: CommentItem[]
}
