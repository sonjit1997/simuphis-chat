# SimuPhish – Sr. Frontend Developer Technical Assessment

## Assessment Overview

Design and implement a **production-grade, real-time chat application** using **Next.js (App Router) and Redux**.

This assessment is calibrated for a senior-level hire — we're not just checking that features work, but *how you make architectural, state-management, and reliability decisions under real constraints*. Treat this as if it were shipping to real users, not a demo.

---

## Required Stack

- **Next.js 14+, App Router** (not Pages Router) — routing decisions and rendering strategy are part of what we're evaluating
- **TypeScript** — strict mode on. `any` should be rare and justified in a comment when used
- **Redux Toolkit** for global/shared state
- **WebSockets** (Socket.io or a comparable library) for real-time transport
- **Cloudinary** for media storage
- A test runner of your choice (Vitest/Jest + React Testing Library, or Playwright for e2e) — required, not optional
- Styling approach is your choice (CSS Modules, Tailwind, styled-components) — be consistent, whatever you pick

---

## Functional Requirements

### 1. Real-time Text and Media Messaging

Design and implement real-time text and media messaging over WebSockets, with the messaging UI rendered on a route that makes sense for App Router conventions.

Explain your **Server Component vs. Client Component split** in the README.

### 2. Drag-and-Forward Messages

Implement drag-and-forward functionality for messages, including:

- Text messages
- Images
- Videos

The interaction should have smooth transitions during the drag action and when the forwarded message appears in the UI.

### 3. Draft Persistence

Unsent input text must:

- Survive a full page refresh
- Be scoped independently per conversation

### 4. Drag-and-Drop Media Upload

Implement media upload using Cloudinary as the centralized media storage solution.

The UI should provide:

- Drag-and-drop upload
- Upload progress
- Upload status/feedback
- Appropriate error handling

### 5. Bi-directional Messaging and Real-time Synchronization

Messages must remain consistent across both participants.

Handle:

- Real-time synchronization
- Duplicate event prevention
- Correct state updates when both participants receive the same event
- Reconnect scenarios
- Recovery of messages sent during a connection gap

There should be **no lost messages on reconnect**.

### 6. Animations

Use smooth and purposeful animations for:

- Message arrival
- Message forwarding
- Typing indicators

Motion should communicate state changes rather than simply decorate the UI.

---

# Core Evaluation Requirements

These are **not bonus points**. They are part of the core deliverable.

## Rendering Strategy

Make a deliberate decision about what belongs in:

- Server Components
- Client Components

If data can be fetched server-side — for example:

- Initial message history
- User/contact list

— fetch it server-side rather than unnecessarily fetching it after hydration.

Document these decisions in the README.

---

## Resilient Data Fetching

Every data-fetching operation must have:

- Loading state
- Error state
- Retry path where appropriate

Requirements:

- No unhandled promise rejections
- Use `AbortController` where a request could plausibly outlive the component that started it

---

## Memoized Derived State

If data is derived from Redux state on every render — for example:

> Messages for a specific conversation

Use Redux Toolkit's `createSelector` / Reselect instead of recomputing the derived data inline.

This will be specifically evaluated.

---

## Race Conditions & Reconnects

Consider and document race conditions such as:

- Socket disconnecting during an active conversation
- Socket reconnecting after messages were sent during the connection gap
- Preventing lost messages
- Preventing duplicate messages
- A message being forwarded while it is concurrently deleted or edited

You do not need to solve every possible edge case, but the README must clearly state:

1. Which cases you considered
2. How you handled them
3. Which cases you explicitly deferred

---

## Server-side Validation

The backend must not blindly trust client-supplied identity or content.

At minimum:

### Authentication

Validate the sender against an **authenticated session**.

Do **not** trust a client-supplied sender/user ID.

### Message Validation

- Validate message payloads server-side
- Cap message length
- Sanitize message content where appropriate

### Upload Validation

Validate upload MIME types server-side.

Do not rely only on client-side file validation.

---

## Accessibility

Every interactive element must have a keyboard-accessible path.

### Drag-and-Forward Accessibility

Native HTML5 drag-and-drop does not provide a native keyboard equivalent.

Provide an accessible alternative, such as:

- Context menu
- Forward button
- Keyboard-triggered action

### Forms

- Every form input must have an associated label
- Buttons must have meaningful accessible names
- Interactive elements must be keyboard accessible

### Images

Images must include meaningful `alt` text.

---

## Tests

Testing is required and should cover actual behavior.

### Unit Tests

At minimum, add unit tests for pure or derived-state logic, such as:

- Message filtering
- Conversation selectors
- Message deduplication
- Sorting helpers

### Component Tests

At minimum, provide component tests for:

#### Message List

Test:

- Loading state
- Error state
- Empty state
- Successful message rendering

#### Composer

Test:

- Loading/submission state
- Error state
- Empty state where applicable
- Message submission behavior
- Draft persistence behavior where practical

The goal is meaningful behavioral coverage, not a token test file.

---

## Type Safety Across the WebSocket Boundary

Socket event payloads must be strongly typed.

Do **not** use `any` for WebSocket payloads.

Consider defining shared types for message and event shapes that are used by both the client and server.

For example:

```ts
type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  type: "text" | "image" | "video";
  content: string;
  createdAt: string;
};
```

Socket events should use explicit typed payloads for both incoming and outgoing events.

---

# Expected README Documentation

The project README should clearly document the following:

## Architecture

- Overall application architecture
- Folder structure
- Server vs. Client Components
- Routing strategy
- Rendering strategy
- State management approach

## Redux Strategy

Explain:

- What state belongs in Redux
- What state remains local to components
- Normalized vs. denormalized message storage
- Memoized selectors using `createSelector`

## WebSocket Strategy

Document:

- Socket connection lifecycle
- Event contracts
- Authentication
- Reconnection behavior
- Duplicate event prevention
- Message recovery after disconnect
- Error handling

## Media Upload Strategy

Document:

- Cloudinary integration
- Upload flow
- Client-side progress handling
- Server-side MIME validation
- Failure/retry behavior

## Reliability

Document how the application handles:

- Network failures
- Socket disconnects
- Reconnects
- Duplicate events
- Race conditions
- Failed uploads
- Failed message sends

## Accessibility

Document:

- Keyboard navigation
- Accessible forwarding alternative
- Form labels
- Image alt text
- Focus management where applicable

## Testing

Document:

- Testing framework
- Unit tests
- Component tests
- E2E tests if included
- How to run the test suite
- What important behaviors are covered

## Trade-offs

Clearly state:

- What was intentionally simplified
- What was deferred
- Why specific architectural decisions were made
- What would be improved for a larger production deployment

---

# Evaluation Focus

The assessment is intended to evaluate senior-level frontend engineering skills, particularly:

- Architecture
- React / Next.js knowledge
- App Router expertise
- Server vs. Client Component decisions
- Redux Toolkit usage
- State normalization
- Memoized selectors
- WebSocket architecture
- Real-time synchronization
- Reconnection and reliability
- Race-condition awareness
- TypeScript type safety
- Server-side validation
- Cloudinary integration
- Accessibility
- Testing quality
- Error handling
- Production readiness
- Code quality
- Engineering trade-offs

---

# Key Principle

Treat the application as if it is going to **real users in production**.

Prioritize:

> **Correctness → Reliability → Accessibility → Maintainability → Performance → Visual polish**

A smaller, well-engineered feature set is preferable to a large feature set implemented superficially.
