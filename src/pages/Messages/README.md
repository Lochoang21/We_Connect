# 💬 Chức năng Chat — We Connect

## Mục lục

- [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
- [Cấu trúc file](#cấu-trúc-file)
- [Luồng hoạt động chi tiết](#luồng-hoạt-động-chi-tiết)
- [REST API](#rest-api)
- [Socket.IO Realtime](#socketio-realtime)
- [Xử lý UI](#xử-lý-ui)
- [Lưu ý kỹ thuật quan trọng](#lưu-ý-kỹ-thuật-quan-trọng)

---

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                     MessagesPage                        │
│  ┌──────────────┐  ┌────────────────────────────────┐   │
│  │ MessagesPanel│  │         Main Chat Area          │   │
│  │ (Sidebar)    │  │  ┌──────────────────────────┐   │   │
│  │              │  │  │      ChatHeader          │   │   │
│  │  Friends     │  │  ├──────────────────────────┤   │   │
│  │  List        │  │  │      ChatMessages        │   │   │
│  │              │  │  │  ┌────────────────────┐  │   │   │
│  │  onClick ────┼──┼─▶│  │  MessageBubble x N │  │   │   │
│  │              │  │  │  └────────────────────┘  │   │   │
│  │              │  │  ├──────────────────────────┤   │   │
│  │              │  │  │      ChatInput           │   │   │
│  └──────────────┘  │  └──────────────────────────┘   │   │
│                    └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                        │
         │                        │
    ┌────▼────┐             ┌─────▼──────┐
    │  REST   │             │  Socket.IO │
    │  API    │             │  /chat     │
    └────┬────┘             └─────┬──────┘
         │                        │
         └────────┬───────────────┘
                  │
           ┌──────▼──────┐
           │   NestJS    │
           │   Backend   │
           └─────────────┘
```

---

## Cấu trúc file

```
src/
├── types/
│   └── chat.types.ts              # Type definitions (Conversation, Message, Socket events)
│
├── services/
│   └── chatService.ts             # REST API calls (conversations, messages)
│
├── sockets/
│   └── chatSocket.ts              # Socket.IO singleton — namespace /chat
│
├── hooks/
│   └── useChatSocket.ts           # Hook quản lý socket lifecycle + emit helpers
│
├── pages/
│   └── Messages/
│       └── MessagesPage.tsx       # Trang chính — orchestrate toàn bộ luồng chat
│
└── components/
    ├── HomePage/
    │   └── MessagesPanel.tsx      # Sidebar — danh sách bạn bè (chọn để chat)
    │
    └── Messages/
        ├── ChatHeader.tsx         # Header hiển thị tên, avatar, trạng thái online
        ├── ChatMessages.tsx       # Danh sách tin nhắn + cursor pagination + typing indicator
        ├── ChatInput.tsx          # Ô nhập tin nhắn + nút gửi
        └── MessageBubble.tsx      # Bong bóng tin nhắn đơn lẻ (own/other, status, reactions)
```

---

## Luồng hoạt động chi tiết

### 1. Mở trang `/messages`

```
User truy cập /messages
    │
    ▼
MessagesPage mount
    │
    ├── useChatSocket: Kết nối socket namespace /chat (JWT trong auth.token)
    │
    └── MessagesPanel: Fetch danh sách bạn bè (friendService)
        └── Hiển thị friends list ở sidebar
```

- Khu vực chat chính hiển thị **NoConversationState** (empty state).
- Socket `/chat` được kết nối ngay khi component mount.

### 2. Chọn bạn bè để chat

```
User click vào bạn bè (friendId: 5)
    │
    ▼
handleSelectConversation(user)
    │
    ├── 1. Set selectedContact (header info)
    ├── 2. Reset messages, cursor, typing
    │
    ├── 3. GET /api/v1/messages/with/5?limit=20
    │       │
    │       ├── Response: { conversationId: 10, items: [...], nextCursor: 95 }
    │       │   → setConversationId(10) → socket join room
    │       │   → Render messages (reverse: newest-first → chronological)
    │       │
    │       └── Response: { conversationId: null, items: [], nextCursor: null }
    │           → Chưa từng chat → Hiển thị empty chat state
    │           → conversationId sẽ được tạo khi gửi tin nhắn đầu tiên
    │
    └── 4. useChatSocket tự emit join_conversation khi conversationId thay đổi
```

### 3. Gửi tin nhắn

```
User nhập nội dung + Enter
    │
    ▼
handleSend(content)
    │
    ├── conversationId !== null (đã có conversation)
    │   └── emit send_message { conversationId: 10, messageType: "text", content, replyToMessageId: null }
    │
    └── conversationId === null (chat lần đầu)
        │
        ├── POST /api/v1/conversations { participantIds: [5], conversationType: "one_to_one" }
        │   → Response: { id: 10, ... }
        │   → setConversationId(10) → socket join room
        │
        └── setTimeout 100ms → emit send_message (đợi socket join room)

    ▼ (Server xử lý)

Server broadcast event: new_message
    │
    ▼
onNewMessage callback
    │
    ├── Number(msg.senderId) === currentUserId → isOwn = true
    ├── toUIMessage(msg) → Message { id, content, isOwn: true, status: "delivered" }
    └── setMessages(prev => dedup([...prev, newMsg]))
        → Tin nhắn hiển thị bên PHẢI, màu PRIMARY (xanh)
```

> ⚠️ **Server là nguồn chuẩn**: Frontend KHÔNG tạo optimistic message. Tin nhắn chỉ render khi nhận `new_message` event từ server.

### 4. Nhận tin nhắn từ đối phương

```
Server broadcast: new_message { message: { senderId: 5, content: "Xin chào", ... } }
    │
    ▼
onNewMessage callback
    │
    ├── Number(msg.senderId) !== currentUserId → isOwn = false
    ├── toUIMessage(msg) → Message { isOwn: false, ... }
    ├── setMessages(prev => dedup([...prev, msg]))
    │   → Tin nhắn hiển thị bên TRÁI, màu CARD (trắng/xám)
    │
    └── Auto seen: emitSeen(messageId)
        → emit seen_message { conversationId: 10, messageId: 50 }
```

### 5. Typing indicator

```
User đang gõ trong ChatInput
    │
    ▼
onTyping(true) → emit typing { conversationId: 10, isTyping: true }
    │
    ├── Sau 1.5s không gõ tiếp → onTyping(false) → emit typing { isTyping: false }
    │
    ▼ (Đối phương nhận)

Server broadcast: user_typing { conversationId: 10, userId: 5, isTyping: true }
    │
    ▼
onUserTyping callback
    │
    ├── Hiển thị "..." typing animation (TypingIndicator component)
    └── Auto-clear sau 3s nếu không nhận thêm event
```

### 6. Seen status (đã đọc)

```
User scroll tới cuối chat → nhận tin mới từ đối phương
    │
    ▼
useEffect detect lastMsg.isOwn === false
    │
    └── emit seen_message { conversationId: 10, messageId: 50 }

    ▼ (Đối phương nhận)

Server broadcast: message_seen { conversationId: 10, userId: 3, messageId: 50, seenAt: "ISO" }
    │
    ▼
onMessageSeen callback
    │
    └── Tất cả tin nhắn isOwn với id ≤ 50 → status: "read"
        → Hiển thị ✓✓ màu primary (xanh)
```

### 7. Cursor pagination (load tin nhắn cũ)

```
User scroll lên đầu (scrollTop < 80px)
    │
    ▼
onLoadMore()
    │
    ├── conversationId !== null
    │   └── GET /api/v1/messages/conversation/10?limit=20&cursor=95
    │
    └── conversationId === null (dùng endpoint with/:userId)
        └── GET /api/v1/messages/with/5?limit=20&cursor=95

    ▼

Response: { items: [...older messages...], nextCursor: 75 }
    │
    ├── Reverse items (newest-first → chronological)
    ├── Prepend vào đầu danh sách: dedup([...olderMessages, ...currentMessages])
    ├── setNextCursor(75)
    └── Scroll position được giữ nguyên (ChatMessages xử lý)
```

### 8. Reconnect

```
Socket mất kết nối (network issue)
    │
    ▼
socket.io tự reconnect (config: infinite attempts, delay 1-5s)
    │
    ▼
reconnect event → useChatSocket handler
    │
    └── emit join_conversation { conversationId: current }
        → Tiếp tục nhận tin nhắn realtime bình thường
```

---

## REST API

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/v1/conversations` | Danh sách conversations của user |
| `POST` | `/api/v1/conversations` | Tạo conversation mới |
| `GET` | `/api/v1/messages/conversation/:id?limit=N&cursor=X` | Tin nhắn theo conversation (cursor pagination) |
| `GET` | `/api/v1/messages/with/:userId?limit=N&cursor=X` | Lịch sử chat giữa 2 user |

### Response format (NestJS `@ResponseMessage`)

```json
{
  "statusCode": 200,
  "message": "Get conversations successfully",
  "data": { /* actual payload */ }
}
```

Frontend unwrap: `res.data?.data ?? res.data`

---

## Socket.IO Realtime

**Namespace:** `/chat`  
**Auth:** `io("/chat", { auth: { token: "<JWT>" } })`

### Events

| Direction | Event | Payload |
|-----------|-------|---------|
| **Emit** | `join_conversation` | `{ conversationId: number }` |
| **Emit** | `send_message` | `{ conversationId, messageType, content, replyToMessageId }` |
| **Emit** | `typing` | `{ conversationId, isTyping }` |
| **Emit** | `seen_message` | `{ conversationId, messageId }` |
| **Listen** | `new_message` | `{ message: ChatMessageEntity }` |
| **Listen** | `user_typing` | `{ conversationId, userId, isTyping }` |
| **Listen** | `message_seen` | `{ conversationId, userId, messageId, seenAt }` |

---

## Xử lý UI

### MessageBubble

| Tin nhắn | Vị trí | Màu sắc | Border radius |
|----------|--------|---------|---------------|
| `isOwn = true` | Bên **phải** | `bg-primary` (xanh) | Grouped corners |
| `isOwn = false` | Bên **trái** | `bg-card` (trắng/xám) + border | Grouped corners |

### Message Status Icons

| Status | Icon | Ý nghĩa |
|--------|------|---------|
| `sending` | 🕐 Clock | Đang gửi |
| `sent` | ✓ Check | Đã gửi |
| `delivered` | ✓✓ CheckCheck (gray) | Đã nhận |
| `read` | ✓✓ CheckCheck (primary) | Đã đọc |
| `failed` | ❗ | Gửi thất bại |

### Message Grouping

Tin nhắn liên tiếp cùng sender được nhóm lại:
- **isGroupStart**: Hiển thị tên sender (chỉ tin đối phương)
- **isGroupEnd**: Hiển thị timestamp + status icon, avatar
- Nhóm bị ngắt nếu khoảng cách > 5 phút

### Date Dividers

Tự động chèn divider giữa các ngày: "Hôm nay", "Hôm qua", "Thứ hai, 28 tháng 4"

---

## Lưu ý kỹ thuật quan trọng

### 1. MySQL `bigint` → String

Backend sử dụng `bigint` cho tất cả các cột ID. TypeORM/mysql2 driver serialize `bigint` thành **string** trong JSON response.

```typescript
// ❌ SAI — "5" === 5 → false
const isOwn = msg.senderId === currentUserId;

// ✅ ĐÚNG — Number("5") === 5 → true
const isOwn = Number(msg.senderId) === currentUserId;
```

**Tất cả** các phép so sánh ID từ backend event đều phải dùng `Number()`.

### 2. Dedup strategy

Mỗi message có `id` duy nhất từ server. Hàm `dedup()` dùng `Map<string, Message>` để loại bỏ duplicate (ví dụ khi nhận lại message sau reconnect).

### 3. Server là nguồn chuẩn

Khi gửi tin nhắn, frontend **KHÔNG** tạo optimistic message. Tin nhắn chỉ hiển thị khi nhận được `new_message` event từ server. Đảm bảo:
- Không có message trùng lặp
- Thứ tự tin nhắn luôn đúng
- ID message luôn là ID thực từ database

### 4. Lazy conversation creation

Khi chat lần đầu với một người (chưa có conversation):
1. `GET /messages/with/:userId` trả `conversationId: null`
2. User gõ tin nhắn đầu tiên → `POST /conversations` tạo mới
3. `setConversationId(conv.id)` → socket join room
4. `setTimeout(100ms)` → `emit send_message`

### 5. Socket reconnect

Config: `reconnectionAttempts: Infinity`, delay 1-5s.  
Sau reconnect → tự động `emit join_conversation` với `conversationId` hiện tại.
