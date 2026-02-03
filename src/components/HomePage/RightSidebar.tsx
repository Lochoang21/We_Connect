import { MessagesPanel } from "@/components/HomePage/MessagesPanel"

export function RightSidebar() {
  return (
    <aside className="w-[320px] sticky top-[65px] h-[calc(100vh-73px)] overflow-y-auto p-4 space-y-4">
      <MessagesPanel />
    </aside>
  )
}
