import { Search, Edit, Filter, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MessagesPanel() {
  const contacts = [
    { name: "Roger Korsgaard", avatar: "/placeholder.svg?height=40&width=40", online: true },
    { name: "Terry Torff", avatar: "/placeholder.svg?height=40&width=40", online: true },
    { name: "Angel Bergson", avatar: "/placeholder.svg?height=40&width=40", online: false },
    { name: "Emerson Gouse", avatar: "/placeholder.svg?height=40&width=40", online: false },
    { name: "Corey Baptista", avatar: "/placeholder.svg?height=40&width=40", online: false },
    { name: "Zain Culhane", avatar: "/placeholder.svg?height=40&width=40", online: false },
    { name: "Randy Lipshutz", avatar: "/placeholder.svg?height=40&width=40", online: false },
    { name: "Craig Botosh", avatar: "/placeholder.svg?height=40&width=40", online: false },
  ]

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Messages</h3>
        <Button variant="ghost" size="icon">
          <Edit className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="text" placeholder="Search" className="pl-10 bg-muted/50 border-0 h-9" />
          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="primary" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger
            value="primary"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Primary
          </TabsTrigger>
          <TabsTrigger
            value="general"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary text-primary"
          >
            Requests(3)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Contacts List */}
      <div className="max-h-[400px] overflow-y-auto">
        {contacts.map((contact, index) => (
          <div key={index} className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                <AvatarFallback>{contact.name[0]}</AvatarFallback>
              </Avatar>
              {contact.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <span className="text-sm flex-1">{contact.name}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
