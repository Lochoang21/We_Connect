import { useCallback, useEffect, useMemo, useState } from "react"
import { Search, Edit, Filter, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { friendService } from "@/services/friendService"
import { useFriendsSocket } from "@/hooks/useFriendsSocket"
import type { CurrentUserFriend, PendingRequestItem } from "@/types/friend.types"

export interface MessagesPanelProps {
  onSelectChat?: (user: CurrentUserFriend) => void;
  selectedChatId?: string | null;
}

export function MessagesPanel({ onSelectChat, selectedChatId }: MessagesPanelProps) {
  const [activeTab, setActiveTab] = useState("primary")
  const [searchTerm, setSearchTerm] = useState("")
  const [friends, setFriends] = useState<CurrentUserFriend[]>([])
  const [friendsTotal, setFriendsTotal] = useState(0)
  const [pendingRequests, setPendingRequests] = useState<PendingRequestItem[]>([])
  const [pendingTotal, setPendingTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [friendsRes, pendingRes] = await Promise.all([
        friendService.getCurrentUserFriends({ current: 1, pageSize: 12 }),
        friendService.getPendingRequests({ current: 1, pageSize: 10 }),
      ])

      setFriends(friendsRes.result ?? [])
      setFriendsTotal(friendsRes.total ?? 0)
      setPendingRequests(pendingRes.result ?? [])
      setPendingTotal(pendingRes.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // Lắng nghe sự kiện socket realtime từ friends namespace
  useFriendsSocket({
    onRequestReceived: () => void fetchData(),
    onRequestAccepted: () => void fetchData(),
    onRequestCancelled: () => void fetchData(),
    onUnfriended:      () => void fetchData(),
  })

  const handleAccept = async (userId: number) => {
    setIsActionLoading(userId)
    try {
      await friendService.acceptRequest(userId)
      void fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setIsActionLoading(null)
    }
  }

  const handleReject = async (userId: number) => {
    setIsActionLoading(userId)
    try {
      await friendService.rejectRequest(userId)
      void fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setIsActionLoading(null)
    }
  }

  const filteredFriends = useMemo(() => {

    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) {
      return friends
    }

    return friends.filter((friend) => {
      const name = friend.name?.toLowerCase() ?? ""
      const email = friend.email?.toLowerCase() ?? ""
      return name.includes(normalizedSearch) || email.includes(normalizedSearch)
    })
  }, [friends, searchTerm])

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) {
      return pendingRequests
    }

    return pendingRequests.filter((item) => {
      const name = item.sender?.name?.toLowerCase() ?? ""
      const email = item.sender?.email?.toLowerCase() ?? ""
      return name.includes(normalizedSearch) || email.includes(normalizedSearch)
    })
  }, [pendingRequests, searchTerm])

  const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

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
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10 bg-muted/50 border-0 h-9"
          />
          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger
            value="primary"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Friends ({friendsTotal})
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Requests ({pendingTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="mt-0">
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && <p className="p-3 text-sm text-muted-foreground">Đang tải...</p>}

            {!isLoading && error && <p className="p-3 text-sm text-destructive">{error}</p>}

            {!isLoading && !error && filteredFriends.length === 0 && (
              <p className="p-3 text-sm text-muted-foreground">Không có bạn bè nào để hiển thị.</p>
            )}

            {!isLoading && !error && filteredFriends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => onSelectChat?.(friend)}
                className={`flex items-center gap-3 p-3 hover:bg-muted/80 cursor-pointer transition-colors ${
                  selectedChatId === friend.id.toString() ? "bg-muted" : ""
                }`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={friend.image || "/placeholder.svg"} />
                  <AvatarFallback>{getInitial(friend.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{friend.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-0">
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && <p className="p-3 text-sm text-muted-foreground">Đang tải...</p>}

            {!isLoading && error && <p className="p-3 text-sm text-destructive">{error}</p>}

            {!isLoading && !error && filteredRequests.length === 0 && (
              <p className="p-3 text-sm text-muted-foreground">Không có lời mời nào.</p>
            )}

            {!isLoading && !error && filteredRequests.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={item.sender.image || "/placeholder.svg"} />
                  <AvatarFallback>{getInitial(item.sender.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.sender.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.sender.email}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="h-8 px-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAccept(item.sender.id)
                    }}
                    disabled={isActionLoading === item.sender.id}
                  >
                    {isActionLoading === item.sender.id ? "..." : "Accept"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReject(item.sender.id)
                    }}
                    disabled={isActionLoading === item.sender.id}
                  >
                    {isActionLoading === item.sender.id ? "..." : "Reject"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
