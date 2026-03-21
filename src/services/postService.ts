import axios from "axios";
import { API } from "./apiService";
import type {
  CreatePostRequest,
  CreatePostResponse,
  GetPostsResponse,
  GetMyPostsResponse,
  GetAuthorPostsResponse,
  GetPostsParams,
  ApiResponse,
  CloudinaryUploadResponse,
  CommentOnPostRequest,
  CommentOnPostResponse,
} from "@/types/post";

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drk0beqjf";
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "we_connect";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Post API endpoints - sử dụng API từ apiService
export const postAPI = {
  // Create new post
  createPost: (data: CreatePostRequest) =>
    API.posts.createPost(data) as Promise<{
      data: ApiResponse<CreatePostResponse>;
    }>,

  // Get posts list with pagination
  getPosts: (params?: GetPostsParams) =>
    API.posts.getPosts(params) as Promise<{
      data: ApiResponse<GetPostsResponse>;
    }>,

  // Get current user's posts
  getMyPosts: () =>
    API.posts.getMyPosts() as Promise<{
      data: ApiResponse<GetMyPostsResponse>;
    }>,

  // Get posts by author id
  getPostsByAuthor: (authorId: string) =>
    API.posts.getPostsByAuthor(authorId) as Promise<{
      data: ApiResponse<GetAuthorPostsResponse>;
    }>,

  // Like a post
  likePost: (postId: string) =>
    API.posts.likePost(postId) as Promise<{
      data: ApiResponse<{ message: string }>;
    }>,

  // Unlike a post
  unlikePost: (postId: string) =>
    API.posts.unlikePost(postId) as Promise<{
      data: ApiResponse<{ message: string }>;
    }>,

  // Comment on a post
  commentOnPost: (postId: string, data: CommentOnPostRequest) =>
    API.posts.commentOnPost(postId, data) as Promise<{
      data: ApiResponse<CommentOnPostResponse>;
    }>,
};

// Helper function for type-safe error handling
function getErrorMessage(error: unknown, fallback = "Lỗi không xác định"): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  // Check if it's an axios error with response.data.message
  const axiosError = error as { response?: { data?: { message?: string } } };
  return axiosError.response?.data?.message ?? fallback;
}

// Cloudinary upload service
export const cloudinaryService = {
  /**
   * Upload single image to Cloudinary
   * @param file - File object from input
   * @returns Secure URL of uploaded image
   */
  uploadImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

      const response = await axios.post<CloudinaryUploadResponse>(
        CLOUDINARY_URL,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.secure_url;
    } catch (error: unknown) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  },

  /**
   * Upload multiple images to Cloudinary with progress tracking
   * @param files - Array of File objects
   * @param onProgress - Progress callback (0-100)
   * @returns Array of secure URLs
   */
  uploadMultipleImages: async (
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<string[]> => {
    try {
      const totalFiles = files.length;
      let completedFiles = 0;

      // Upload images in parallel but track progress
      const uploadPromises = files.map(async (file) => {
        const url = await cloudinaryService.uploadImage(file);
        completedFiles++;
        if (onProgress) {
          const progress = Math.round((completedFiles / totalFiles) * 100);
          onProgress(progress);
        }
        return url;
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error: unknown) {
      console.error("Multiple upload error:", error);
      throw new Error("Failed to upload images");
    }
  },
};

// Post service - Wrapper methods with error handling
export const postService = {
  /**
   * Create a new post with optional images
   * @param content - Post content
   * @param files - Optional array of image files
   * @param privacy - Post privacy setting
   * @param onProgress - Progress callback (0-100)
   * @returns Created post data
   */
  createPost: async (
    content: string,
    files: File[] = [],
    privacy: "public" | "friends" | "private" = "public",
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<CreatePostResponse>> => {
    try {
      let mediaUrls: string[] = [];

      // Step 1: Upload images to Cloudinary if any
      if (files.length > 0) {
        mediaUrls = await cloudinaryService.uploadMultipleImages(files, onProgress);
      }

      // Step 2: Create post with media URLs
      const postData: CreatePostRequest = {
        content,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        privacy,
      };

      const response = await postAPI.createPost(postData);
      return response.data;
    } catch (error: unknown) {
      console.error("Create post error:", error);
      throw new Error(getErrorMessage(error, "Failed to create post"));
    }
  },

  /**
   * Get posts list with pagination and search
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 10)
   * @param query - Search query (optional)
   * @returns Posts list with pagination info
   */
  getPosts: async (page: number = 1, pageSize: number = 10, query?: string): Promise<GetPostsResponse> => {
    try {
      const response = await postAPI.getPosts({ page, pageSize, query });
      return response.data.data;
    } catch (error: unknown) {
      console.error("Get posts error:", error);
      throw new Error(getErrorMessage(error, "Failed to get posts"));
    }
  },

  /**
   * Get current user's posts
   * @returns Posts list with pagination info
   */
  getMyPosts: async (): Promise<GetMyPostsResponse> => {
    try {
      const response = await postAPI.getMyPosts();
      return response.data.data;
    } catch (error: unknown) {
      console.error("Get my posts error:", error);
      throw new Error(getErrorMessage(error, "Failed to get my posts"));
    }
  },

  /**
   * Get posts by author id
   * @param authorId - Author user id
   * @returns Author posts list with pagination info
   */
  getPostsByAuthor: async (authorId: string): Promise<GetAuthorPostsResponse> => {
    try {
      const response = await postAPI.getPostsByAuthor(authorId);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Get posts by author error:", error);
      throw new Error(getErrorMessage(error, "Failed to get posts by author"));
    }
  },

  /**
   * Like a post
   * @param postId - Post ID to like
   * @returns Success message
   */
  likePost: async (postId: string): Promise<{ message: string }> => {
    try {
      const response = await postAPI.likePost(postId);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Like post error:", error);
      throw new Error(getErrorMessage(error, "Failed to like post"));
    }
  },
  /**
   * Unlike a post
   * @param postId - Post ID to unlike
   * @returns Success message
   */
  unlikePost: async (postId: string): Promise<{ message: string }> => {
    try {
      const response = await postAPI.unlikePost(postId);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Unlike post error:", error);
      throw new Error(getErrorMessage(error, "Failed to unlike post"));
    }
  },

  /**
   * Comment on a post or reply to a comment
   * @param postId - Post ID to comment on
   * @param content - Comment content
   * @param parentCommentId - Optional parent comment ID for replies
   * @returns Success message
   */
  commentOnPost: async (
    postId: string,
    content: string,
    parentCommentId?: number
  ): Promise<{ message: string }> => {
    try {
      const requestData: CommentOnPostRequest = {
        content,
        ...(parentCommentId && { parentCommentId }),
      };

      const response = await postAPI.commentOnPost(postId, requestData);
      return response.data.data;
    } catch (error: unknown) {
      console.error("Comment on post error:", error);
      throw new Error(getErrorMessage(error, "Failed to comment on post"));
    }
  },
};

export default postService;
