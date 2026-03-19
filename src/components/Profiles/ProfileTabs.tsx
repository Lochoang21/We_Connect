import { ChevronDown } from "lucide-react"
import { useState } from "react"

const TABS = ["Giới thiệu", "Bạn bè", "Ảnh", "Bài viết", "Thêm"]

export function ProfileTabs() {
  const [active, setActive] = useState(0)

  return (
    <div className="flex items-center border-t border-border/40 -mx-4 px-4 overflow-x-auto no-scrollbar">
      {TABS.map((tab, i) => (
        <button
          key={tab}
          className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
            ${active === i
              ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-t-full"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
            }`}
          onClick={() => setActive(i)}
        >
          {tab}
          {tab === "Thêm" && <ChevronDown className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5" />}
        </button>
      ))}
    </div>
  )
}
