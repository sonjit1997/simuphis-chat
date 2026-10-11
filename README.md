# SimuPhish – Real-Time Chat Application

A production-grade, highly resilient real-time chat application built with **Next.js 16 (App Router)**, **TypeScript (Strict Mode)**, **Redux Toolkit**, **WebSockets (Socket.io)**, and **Cloudinary** media storage.

Calibrated to senior frontend engineering standards, prioritizing:
> **Correctness → Reliability → Accessibility → Maintainability → Performance → Visual Polish**

---

## 🏗️ Architecture & Rendering Strategy

### 1. Server Components vs. Client Components Split

| Layer | Component Type | File Path | Rationale & Responsibility |
| :--- | :--- | :--- | :--- |
| **Root Layout** | Server Component | `src/app/layout.tsx` | Sets HTML structure, metadata, and global dark theme typography. |
| **Chat Layout** | Server Component | `src/app/(chat)/layout.tsx` | Pre-fetches initial conversations and chat history server-side on initial request; hydrates Redux store without client hydration delay. |
| **Conversation Route** | Server Component | `src/app/(chat)/[conversationId]/page.tsx` | Pre-renders dynamic routes (`/conv-1`, `/conv-2`, `/conv-3`) with `generateStaticParams` and wraps client stream in `<Suspense>`. |
| **Sidebar** | Client Component | `src/components/chat/Sidebar.tsx` | Interactive search filtering, drag-and-drop forward targets, and real-time unread badges. |
| **Chat Container** | Client Component | `src/components/chat/ChatContainer.tsx` | Manages real-time WebSocket messaging, optimistic updates, and drag-and-drop file upload. |
| **Composer** | Client Component | `src/components/chat/Composer.tsx` | Handles input state, per-conversation draft persistence in `localStorage`, and upload progress bars. |
| **Message List** | Client Component | `src/components/chat/MessageList.tsx` | Virtualized scroll anchor, memoized message grouping, and Framer Motion arrival animations. |

---

## 🧠 Redux State Architecture & Memoization

State is normalized according to Redux Toolkit standards using `createEntityAdapter`:

### 1. Normalized Slices (`src/store/slices/`)
- **`conversationsSlice`**: Entities dictionary indexed by conversation ID, sorted by `updatedAt`.
- **`messagesSlice`**: Entities dictionary indexed by message ID, tracking delivery states (`sending`, `delivered`, `failed`).
- **`draftsSlice`**: Stores unsent draft messages scoped independently per conversation (`draftsByConversationId`).
- **`socketSlice`**: Tracks WebSocket connection lifecycle (`connected`, `connecting`, `disconnected`), active typing indicators, and forward modal state.

### 2. Memoized Derived Selectors (`createSelector`)
Derived data is strictly memoized to avoid unnecessary component re-renders:
```ts
// src/store/selectors/chatSelectors.ts
export const selectMessagesByActiveConversation = createSelector(
  [selectAllMessages, selectActiveConversationId],
  (messages, activeId) => {
    if (!activeId) return [];
    return messages.filter((msg) => msg.conversationId === activeId);
  }
);

export const selectGroupedMessagesForActiveConversation = createSelector(
  [selectMessagesByActiveConversation],
  (messages) => groupMessages(messages)
);
```

---

## ⚡ Real-Time WebSocket Transport & Reliability

### 1. Connection & Handshake Lifecycle
- **Handshake Authentication:** The client sends an authenticated session token in `socket.handshake.auth.token`. The server validates the session and binds the verified user identity to the socket context.
- **Reconnection Behavior:** Automatic reconnection with exponential backoff (1,000ms to 5,000ms).

### 2. Idempotency & Duplicate Prevention
1. The client generates a unique client temporary ID (`clientTempId`) via UUID for optimistic rendering.
2. The server records processed IDs in an in-memory cache (`processedTempIds`).
3. If network jitter causes duplicate delivery, the server responds with the cached ack, preventing duplicate records.

### 3. Reconnect Gap Recovery (`message:sync`)
When the socket transitions from disconnected to connected:
1. The client inspects the latest message timestamp in the active Redux conversation.
2. Emits `message:sync` with `{ conversationId, lastSyncedAt }`.
3. The server queries all messages created after `lastSyncedAt` and returns them.
4. The client's `deduplicateMessages` utility merges the delta into Redux with zero lost messages.

---

## ☁️ Media Upload Strategy (Cloudinary)

1. **Centralized Storage:** Centralized media pipeline using the Cloudinary Node SDK.
2. **Server-Side Validation (`src/app/api/upload/route.ts`):**
   - **MIME Whitelist:** Strictly enforces allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `video/mp4`, `video/webm`, `video/quicktime`.
   - **Size Limit:** Enforces a 50MB file size ceiling.
3. **Client Upload Pipeline:**
   - Full-viewport drag-and-drop dropzone over chat viewport.
   - Real-time progress bar (0% → 100%) in the composer.
   - Surface error feedback with single-click retry action.

---

## ♿ Accessibility (WCAG 2.1 AA)

1. **Drag-and-Forward Accessible Alternative:**
   - Native HTML5 drag-and-drop allows dragging any message onto sidebar conversations.
   - For keyboard-only and screen reader users, each message provides an accessible **Forward Button**.
   - Pressing Forward opens the **`ForwardModal`**, which supports full keyboard navigation:
     - `Tab` / `Shift+Tab` for focus traversal
     - Click or `Enter` to select conversation and confirm
     - `Escape` to immediately dismiss
2. **Forms & Interactive Controls:**
   - Textarea and input elements have explicit ARIA labels and placeholders.
   - Action buttons include meaningful `title` and `aria-label` attributes.
   - Images include descriptive `alt` text.

---

## 🧪 Testing Suite (Vitest & React Testing Library)

Unit and component test suites cover all critical behaviors:

### Run Tests:
```bash
npm run test
```

### Coverage Breakdown:
- **Unit Tests:**
  - `messageGrouping.test.ts`: Message clustering by sender and threshold.
  - `dateFormatters.test.ts`: 12-hour formatting and day dividers.
  - `chatSelectors.test.ts`: Redux `createSelector` memoization integrity.
  - `deduplication.test.ts`: Duplicate event elimination and optimistic replacement.
  - `upload.test.ts`: Server-side MIME type whitelist and file size rejection.
- **Component Tests:**
  - `MessageList.test.tsx`: Empty state and successful message rendering.
  - `Composer.test.tsx`: Draft persistence recovery across re-renders and send submission.

---

## ⚖️ Engineering Trade-offs & Production Roadmap

| Area | Current Implementation | Production Scale Evolution |
| :--- | :--- | :--- |
| **Message Database** | In-memory server store with mock pre-seeding | PostgreSQL / ScyllaDB with Redis pub/sub across multi-node socket clusters |
| **Authentication** | Handshake token verification | OAuth2 / NextAuth JWT with rotating refresh tokens |
| **Virtualization** | DOM scroll anchoring with React ref | `@tanstack/react-virtual` for conversations with 50,000+ messages |
| **End-to-End Encryption** | Clean HTTPS/WSS transport | Web Crypto API (Signal Protocol / Olm) |

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
```

### 3. Start WebSocket Server
```bash
npm run server
```

### 4. Start Next.js App
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000).
