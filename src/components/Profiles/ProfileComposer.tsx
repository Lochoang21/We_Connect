import { Image, Smile, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import type { ProfileUser } from "@/components/Profiles/types"

interface ProfileComposerProps {
  user: ProfileUser
}

export function ProfileComposer({ user }: ProfileComposerProps) {
  const [text] = useState("")

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 ring-2 ring-border flex-shrink-0">
          <AvatarImage src={user.image || "/placeholder.svg"} />
          <AvatarFallback className="font-semibold text-sm bg-muted">{user.name[0]}</AvatarFallback>
        </Avatar>
        <button
          className="flex-1 text-left px-4 py-2.5 rounded-full bg-muted/70 hover:bg-muted border border-border/50 hover:border-primary/30 transition-colors text-sm text-muted-foreground"
          onClick={() => { }}
        >
          {text ? text : "Bạn đang nghĩ gì?"}
        </button>
      </div>

      <div className="border-t border-border/50 mt-3 pt-2.5">
        <div className="flex items-center justify-around">
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors">
            <Video className="w-5 h-5 text-red-500" />
            <span>Video trực tiếp</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors">
            <Image className="w-5 h-5 text-green-500" />
            <span>Ảnh/Video</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors">
            <Smile className="w-5 h-5 text-amber-500" />
            <span>Cảm xúc</span>
          </button>
        </div>
      </div>
    </div>
  )
}
