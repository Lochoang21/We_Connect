// Post User Type (from backend response)
export interface PostUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

// Post Types
export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls?: string[];
  privacy: "public" | "friends" | "private";
  createdAt: string;
  updatedAt: string;
  isDeleted: number;
  deletedAt: string | null;
  // Extended fields for display
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes?: number;
  comments?: number;
  shares?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

// Create Post Request
export interface CreatePostRequest {
  content: string;
  mediaUrls?: string[];
  privacy: "public" | "friends" | "private";
}

// Create Post Response
export interface CreatePostResponse {
  userId: string;
  content: string;
  privacy: string;
  deletedAt: string | null;
  id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: number;
}

// Post Item in List (from backend)
export interface PostListItem {
  id: string;
  userId: string;
  content: string;
  privacy: "public" | "friends" | "private";
  createdAt: string;
  updatedAt: string;
  user: PostUser;
  mediaUrls: string[];
  // Like information (from backend join with likes table)
  likesCount?: number;  // Total likes count
  isLiked?: boolean;    // Current user has liked this post
}

// Get Posts Response with Pagination
export interface GetPostsResponse {
  result: PostListItem[];
  totalPage: number;
}

// Get Posts Request Params
export interface GetPostsParams {
  page?: number;
  pageSize?: number;
  query?: string;
}

// Comment Types
export interface CreateCommentRequest {
  content: string;
  parentCommentId?: number; // If present, it's a reply to a comment
}

// Backend only returns message, not full comment object
export interface CreateCommentResponse {
  message: string;
}

// Alias for consistency with service method names
export type CommentOnPostRequest = CreateCommentRequest;
export type CommentOnPostResponse = CreateCommentResponse;

export interface CommentResponse {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
  createdAt: string;
  updatedAt: string;
  user: PostUser;
}

// Cloudinary Upload Response
export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  asset_id: string;
  access_mode: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
