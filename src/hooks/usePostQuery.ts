import { useQuery } from "@tanstack/react-query";
import { postService } from "../services/postService";

export const postQueryKeys = {
  all: ["posts"] as const,
  authorImages: (userId: number | string) => ["posts", "author-images", userId] as const,
};

/**
 * Hook lấy danh sách ảnh của một tác giả
 */
export const useAuthorImages = (userId: number | string) =>
  useQuery({
    queryKey: postQueryKeys.authorImages(userId),
    queryFn: () => postService.getAuthorImages(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
