import { describe, expect, it } from "vitest";
import { groupMessages } from "./messageGrouping";
import { Message } from "@/types/chat";

describe("groupMessages", () => {
  it("marks first and last of group correctly for single sender messages", () => {
    const messages: Message[] = [
      {
        id: "1",
        conversationId: "conv-1",
        senderId: "user-1",
        senderName: "Alice",
        type: "text",
        content: "First",
        createdAt: "2026-10-11T10:00:00.000Z",
        status: "delivered",
      },
      {
        id: "2",
        conversationId: "conv-1",
        senderId: "user-1",
        senderName: "Alice",
        type: "text",
        content: "Second",
        createdAt: "2026-10-11T10:01:00.000Z",
        status: "delivered",
      },
      {
        id: "3",
        conversationId: "conv-1",
        senderId: "user-2",
        senderName: "Bob",
        type: "text",
        content: "Reply",
        createdAt: "2026-10-11T10:02:00.000Z",
        status: "delivered",
      },
    ];

    const grouped = groupMessages(messages);

    expect(grouped).toHaveLength(3);
    // Message 1 from Alice: first of group, not last of group
    expect(grouped[0].isFirstOfGroup).toBe(true);
    expect(grouped[0].isLastOfGroup).toBe(false);

    // Message 2 from Alice: not first, but last of group before Bob
    expect(grouped[1].isFirstOfGroup).toBe(false);
    expect(grouped[1].isLastOfGroup).toBe(true);

    // Message 3 from Bob: single message, both first and last
    expect(grouped[2].isFirstOfGroup).toBe(true);
    expect(grouped[2].isLastOfGroup).toBe(true);
  });
});
