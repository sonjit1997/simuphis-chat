import { describe, expect, it } from "vitest";
import {
  selectActiveConversation,
  selectGroupedMessagesForActiveConversation,
  selectMessagesByActiveConversation,
} from "./chatSelectors";
import { RootState } from "../index";

describe("chatSelectors memoization", () => {
  const mockState: RootState = {
    conversations: {
      ids: ["conv-1", "conv-2"],
      entities: {
        "conv-1": {
          id: "conv-1",
          type: "direct",
          name: "Sarah",
          avatarUrl: "",
          participantIds: ["u1", "u2"],
          participants: [],
          unreadCount: 0,
          updatedAt: "2026-10-11T10:00:00.000Z",
        },
        "conv-2": {
          id: "conv-2",
          type: "direct",
          name: "Alex",
          avatarUrl: "",
          participantIds: ["u1", "u3"],
          participants: [],
          unreadCount: 0,
          updatedAt: "2026-10-11T10:00:00.000Z",
        },
      },
      activeConversationId: "conv-1",
      status: "succeeded",
      error: null,
    },
    messages: {
      ids: ["m1", "m2"],
      entities: {
        m1: {
          id: "m1",
          conversationId: "conv-1",
          senderId: "u2",
          senderName: "Sarah",
          type: "text",
          content: "Hello",
          createdAt: "2026-10-11T10:00:00.000Z",
          status: "delivered",
        },
        m2: {
          id: "m2",
          conversationId: "conv-2",
          senderId: "u3",
          senderName: "Alex",
          type: "text",
          content: "Other conversation",
          createdAt: "2026-10-11T10:01:00.000Z",
          status: "delivered",
        },
      },
      status: "succeeded",
      error: null,
    },
    drafts: {
      draftsByConversationId: {
        "conv-1": "Saved draft text",
      },
    },
    socket: {
      status: "connected",
      typingMap: {},
      forwardModalMessageId: null,
    },
  };

  it("selects active conversation accurately", () => {
    const active = selectActiveConversation(mockState);
    expect(active?.id).toBe("conv-1");
    expect(active?.name).toBe("Sarah");
  });

  it("filters and groups messages exclusively for active conversation", () => {
    const messages = selectMessagesByActiveConversation(mockState);
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe("m1");

    const grouped = selectGroupedMessagesForActiveConversation(mockState);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].isFirstOfGroup).toBe(true);
    expect(grouped[0].isLastOfGroup).toBe(true);
  });
});
