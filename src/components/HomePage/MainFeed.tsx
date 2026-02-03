/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { CreatePost } from "@/components/HomePage/CreatePost"
import { PostCard } from "@/components/HomePage/PostCard"
import { postService } from "@/services/postService"
import { useSnackbar } from "@/context/AlertProvider"
import type { PostListItem } from "@/types/post"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function MainFeed() {
  const { showSnackbar } = useSnackbar()
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [query] = useState("")
  const pageSize = 10

  // Load posts
  const loadPosts = async (pageNum: number = 1, searchQuery: string = "") => {
    try {
      setLoading(true)
      const response = await postService.getPosts(
        pageNum,
        pageSize,
        searchQuery || undefined
      )
      setPosts(response.result)
      setTotalPages(response.totalPage)
      setPage(pageNum)
    } catch (error: any) {
      showSnackbar("error", error.message || "Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadPosts()
  }, [])

  // Listen for refresh feed event (triggered after creating post)
  useEffect(() => {
    const handleRefresh = () => {
      loadPosts(1, query)
    }
    window.addEventListener("refreshFeed", handleRefresh)
    return () => window.removeEventListener("refreshFeed", handleRefresh)
  }, [query])

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadPosts(newPage, query)
    }
  }

  return (
    <main className="flex-1 max-w-[780px] p-4 space-y-4">
      <CreatePost />
      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card rounded-lg p-8 border border-border text-center">
          <p className="text-muted-foreground">
            {query ? "No posts found matching your search" : "No posts yet"}
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
