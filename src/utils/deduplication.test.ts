import { describe, expect, it } from "vitest";
import { deduplicateMessages } from "./deduplication";
import { Message } from "@/types/chat";

describe("deduplicateMessages", () => {
  it("removes duplicate messages with the same id", () => {
    const existing: Message[] = [
      {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "u1",
        senderName: "Alice",
        type: "text",
        content: "Hello",
        createdAt: "2026-10-11T10:00:00.000Z",
        status: "delivered",
      },
    ];

    const incoming: Message[] = [
      {
        id: "msg-1", // duplicate
        conversationId: "conv-1",
        senderId: "u1",
        senderName: "Alice",
        type: "text",
        content: "Hello",
        createdAt: "2026-10-11T10:00:00.000Z",
        status: "delivered",
      },
      {
        id: "msg-2", // new
        conversationId: "conv-1",
        senderId: "u2",
        senderName: "Bob",
        type: "text",
        content: "World",
        createdAt: "2026-10-11T10:01:00.000Z",
        status: "delivered",
      },
    ];

    const result = deduplicateMessages(existing, incoming);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("msg-1");
    expect(result[1].id).toBe("msg-2");
  });

  it("replaces optimistic temp message with server confirmed message", () => {
    const existing: Message[] = [
      {
        id: "temp-123",
        clientTempId: "temp-123",
        conversationId: "conv-1",
        senderId: "u1",
        senderName: "Alice",
        type: "text",
        content: "Optimistic send",
        createdAt: "2026-10-11T10:00:00.000Z",
        status: "sending",
      },
    ];

    const incoming: Message[] = [
      {
        id: "server-456",
        clientTempId: "temp-123", // matches client temp
        conversationId: "conv-1",
        senderId: "u1",
        senderName: "Alice",
        type: "text",
        content: "Optimistic send",
        createdAt: "2026-10-11T10:00:00.000Z",
        status: "delivered",
      },
    ];

    const result = deduplicateMessages(existing, incoming);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("server-456");
    expect(result[0].status).toBe("delivered");
  });
});
