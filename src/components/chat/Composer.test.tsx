import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Composer } from "./Composer";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import conversationsReducer from "@/store/slices/conversationsSlice";
import messagesReducer from "@/store/slices/messagesSlice";
import draftsReducer from "@/store/slices/draftsSlice";
import socketReducer from "@/store/slices/socketSlice";
import { RootState } from "@/store";

function createMockStore(initialDraft = "") {
  const preloadedState: Partial<RootState> = {
    conversations: {
      ids: ["conv-1"],
      entities: {
        "conv-1": {
          id: "conv-1",
          type: "direct",
          name: "Sarah",
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
    messages: { ids: [], entities: {}, status: "succeeded", error: null },
    drafts: {
      draftsByConversationId: initialDraft ? { "conv-1": initialDraft } : {},
    },
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

describe("Composer Component", () => {
  it("restores draft persistence for active conversation", () => {
    const store = createMockStore("Persisted draft message");
    render(
      <Provider store={store}>
        <Composer
          onSendMessage={vi.fn()}
          replyingTo={null}
          onCancelReply={vi.fn()}
        />
      </Provider>
    );

    const textarea = screen.getByPlaceholderText(
      /Type a message/i
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("Persisted draft message");
  });

  it("submits message on send click and clears text", () => {
    const handleSend = vi.fn();
    const store = createMockStore("");
    render(
      <Provider store={store}>
        <Composer
          onSendMessage={handleSend}
          replyingTo={null}
          onCancelReply={vi.fn()}
        />
      </Provider>
    );

    const textarea = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(textarea, { target: { value: "New message content" } });

    const sendButton = screen.getByLabelText("Send message");
    fireEvent.click(sendButton);

    expect(handleSend).toHaveBeenCalledWith("New message content", null);
  });
});
