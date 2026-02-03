import { Home, Users, Calendar, Video, ImageIcon, ShoppingBag, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function LeftSidebar() {
  const navItems = [
    { icon: Home, label: "Feed", active: true, badge: null },
    { icon: Users, label: "Friends", active: false, badge: null },
    { icon: Calendar, label: "Event", active: false, badge: 1 },
    { icon: Video, label: "Watch Videos", active: false, badge: null },
    { icon: ImageIcon, label: "Photos", active: false, badge: null },
    { icon: ShoppingBag, label: "Marketplace", active: false, badge: null },
    { icon: FileText, label: "Files", active: false, badge: 3 },
  ]

  return (
    <aside className="w-[280px] sticky top-[65px] h-[calc(100vh-73px)] overflow-y-auto p-4 border-r border-border">
      {/* User Profile Card */}
      <div className="bg-card rounded-lg p-4 mb-4 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src="/placeholder.svg?height=48&width=48" />
            <AvatarFallback>JB</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">Jakob Botosh</h3>
            <p className="text-xs text-muted-foreground">@jbotosh</p>
          </div>
        </div>
        <div className="flex justify-between text-center">
          <div>
            <p className="font-semibold text-sm">120</p>
            <p className="text-xs text-muted-foreground">Follower</p>
          </div>
          <div>
            <p className="font-semibold text-sm">80</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
          <div>
            <p className="font-semibold text-sm">90</p>
            <p className="text-xs text-muted-foreground">Post</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1 mb-6">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? "default" : "ghost"}
            className="w-full justify-start gap-3 relative"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.badge && (
              <Badge variant="destructive" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <a href="#" className="hover:underline">
            Privacy Terms
          </a>
          <span>·</span>
          <a href="#" className="hover:underline">
            Advertising
          </a>
          <span>·</span>
          <a href="#" className="hover:underline">
            Cookies
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Platform © 2025</p>
      </div>
    </aside>
  )
}
