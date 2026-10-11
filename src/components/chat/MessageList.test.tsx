import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MessageList } from "./MessageList";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import conversationsReducer from "@/store/slices/conversationsSlice";
import messagesReducer from "@/store/slices/messagesSlice";
import draftsReducer from "@/store/slices/draftsSlice";
import socketReducer from "@/store/slices/socketSlice";
import { Message } from "@/types/chat";
import { RootState } from "@/store";

function createMockStore(messages: Message[] = []) {
  const preloadedState: Partial<RootState> = {
    conversations: {
      ids: ["conv-1"],
      entities: {
        "conv-1": {
          id: "conv-1",
          type: "direct",
          name: "Test User",
          avatarUrl: "",
          participantIds: ["u1", "u2"],
          participants: [],
          unreadCount: 0,
          updatedAt: new Date().toISOString(),
        },
      },
      activeConversationId: "conv-1",
      status: "succeeded",
      error: null,
    },
    messages: {
      ids: messages.map((m) => m.id),
      entities: messages.reduce<Record<string, Message>>((acc, m) => {
        acc[m.id] = m;
        return acc;
      }, {}),
      status: "succeeded",
      error: null,
    },
    drafts: { draftsByConversationId: {} },
    socket: { status: "connected", typingMap: {}, forwardModalMessageId: null },
  };

  return configureStore({
    reducer: {
      conversations: conversationsReducer,
      messages: messagesReducer,
      drafts: draftsReducer,
      socket: socketReducer,
    },
    preloadedState: preloadedState as RootState,
  });
}

describe("MessageList Component", () => {
  it("renders empty state when there are no messages", () => {
    const store = createMockStore([]);
    render(
      <Provider store={store}>
        <MessageList currentUserId="u1" onReply={vi.fn()} onForward={vi.fn()} />
      </Provider>
    );

    expect(screen.getByText("No messages yet")).toBeDefined();
    expect(
      screen.getByText("Send a greeting or drag-and-drop media to start this conversation.")
    ).toBeDefined();
  });

  it("renders messages successfully with sender and content", () => {
    const store = createMockStore([
      {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "u2",
        senderName: "Sarah Jenkins",
        type: "text",
        content: "Hello from Sarah!",
        createdAt: new Date().toISOString(),
        status: "delivered",
      },
    ]);

    render(
      <Provider store={store}>
        <MessageList currentUserId="u1" onReply={vi.fn()} onForward={vi.fn()} />
      </Provider>
    );

    expect(screen.getByText("Hello from Sarah!")).toBeDefined();
    expect(screen.getByText("Sarah Jenkins")).toBeDefined();
  });
});
