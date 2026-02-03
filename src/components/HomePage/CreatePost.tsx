/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, type ChangeEvent } from "react"
import { ImageIcon, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/redux/hooks"
import { postService } from "@/services/postService"
import { useSnackbar } from "@/context/AlertProvider"
import { compressImages } from "@/lib/imageUtils"

export function CreatePost() {
  const { user } = useAppSelector((state: any) => state.auth)
  const { showSnackbar } = useSnackbar()

  const [content, setContent] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [privacy, setPrivacy] = useState<"public" | "friends" | "private">("public")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle image selection
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)

    // Validate file types
    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        showSnackbar("error", `${file.name} is not an image file`)
        return false
      }
      return true
    })

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file))

    setSelectedFiles((prev) => [...prev, ...validFiles])
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
  }

  // Remove image
  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))

    // Revoke preview URL to free memory
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle post submission
  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) {
      showSnackbar("error", "Please enter some content or select images")
      return
    }

    setIsLoading(true)
    setUploadProgress(0)

    try {
      // Step 1: Compress images
      if (selectedFiles.length > 0) {
        setUploadStatus(`Compressing ${selectedFiles.length} image(s)...`)
        setUploadProgress(10)

        const compressedFiles = await compressImages(selectedFiles, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85
        })

        setUploadProgress(30)

        // Step 2: Upload compressed images
        setUploadStatus(`Uploading ${compressedFiles.length} image(s)...`)

        await postService.createPost(
          content,
          compressedFiles,
          privacy,
          (progress) => {
            // Update progress: 30% to 90%
            setUploadProgress(30 + (progress * 60 / 100))
          }
        )
      } else {
        // No images, just create post
        await postService.createPost(content, [], privacy)
      }

      setUploadProgress(100)
      setUploadStatus("Post created!")
      showSnackbar("success", "Post created successfully!")

      // Reset form
      setContent("")
      setSelectedFiles([])
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
      setPreviewUrls([])
      setPrivacy("public")

      // Small delay to show 100% progress
      setTimeout(() => {
        setUploadProgress(0)
        setUploadStatus("")
      }, 500)

      // Trigger feed refresh
      window.dispatchEvent(new Event("refreshFeed"))
    } catch (error: any) {
      showSnackbar("error", error.message || "Failed to create post")
      setUploadProgress(0)
      setUploadStatus("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex gap-3 mb-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user?.image || "/placeholder.svg"} />
          <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <textarea
          placeholder="What's on your mind?"
          className="flex-1 bg-muted/50 border-0 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary max-h-[50px] min-h-[50px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Image Previews */}
      {previewUrls.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isLoading && uploadProgress > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">{uploadStatus}</span>
            <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
            disabled={isLoading}
          />
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <ImageIcon className="w-4 h-4 text-green-500" />
            Image/Video
          </Button>

          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as any)}
            className="bg-muted/50 border-0 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          >
            <option value="public">Public</option>
            <option value="friends">Friends</option>
            <option value="private">Only me</option>
          </select>
        </div>

        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isLoading || (!content.trim() && selectedFiles.length === 0)}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            "Share Post"
          )}
        </Button>
      </div>
    </div>
  )
}
