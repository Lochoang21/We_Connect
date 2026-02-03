// src/utils/mockPostData.ts
// Mock data for testing like status before backend is ready

import type { PostListItem } from "@/types/post";

/**
 * Mock function to simulate backend response with like info
 * Remove this when backend API returns isLiked and likesCount
 */
export const mockPostsWithLikeStatus = (
  posts: PostListItem[],
): PostListItem[] => {
  // Mock: Simulate random likes for testing
  return posts.map((post) => ({
    ...post,
    // Mock likesCount (random 0-10)
    likesCount: post.likesCount ?? Math.floor(Math.random() * 10),
    // Mock isLiked (random true/false for demo)
    isLiked: post.isLiked ?? Math.random() > 0.5,
  }));
};

/**
 * Helper: Add like status to a single post (after liking)
 */
export const updatePostLikeStatus = (
  post: PostListItem,
  isLiked: boolean,
  increment: number = 1
): PostListItem => {
  return {
    ...post,
    isLiked,
    likesCount: (post.likesCount ?? 0) + increment,
  };
};
