import { Camera, Grid2x2, LayoutGrid, X, Loader2 } from "lucide-react"
import { useState } from "react"
import { useAuthorImages } from "@/hooks/usePostQuery"

interface ProfilePhotosProps {
  userId: number
  isOwn?: boolean
}

export function ProfilePhotos({ userId, isOwn = false }: ProfilePhotosProps) {
  const [layout, setLayout] = useState<"grid" | "large">("grid")
  const [lightbox, setLightbox] = useState<string | null>(null)

  const { data: photos = [], isLoading, isError } = useAuthorImages(userId)

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base">Ảnh</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{photos.length} ảnh</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLayout("grid")}
            className={`p-1.5 rounded-lg transition-colors ${layout === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout("large")}
            className={`p-1.5 rounded-lg transition-colors ${layout === "large" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Grid2x2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium italic">Đang tải ảnh...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-10">
          <p className="text-sm text-destructive">Đã có lỗi xảy ra khi tải danh sách ảnh.</p>
        </div>
      ) : photos.length === 0 ? (
         <div className="text-center py-12">
           <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
             <Camera className="w-6 h-6 text-muted-foreground/50" />
           </div>
           <p className="text-sm text-muted-foreground">Chưa có ảnh nào.</p>
           {isOwn && (
             <button className="mt-2 text-sm text-primary font-medium hover:underline">
               Thêm ảnh đầu tiên
             </button>
           )}
         </div>
       ) : (
        <div
          className={`grid gap-1 ${
            layout === "grid" ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2"
          }`}
        >
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setLightbox(url)}
              className="relative overflow-hidden rounded-lg aspect-square group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}