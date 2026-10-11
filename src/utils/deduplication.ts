import { Message } from "@/types/chat";

/**
 * Merges existing messages with incoming messages, eliminating duplicates
 * by primary server message id and temporary clientTempId.
 */
export function deduplicateMessages(
  existingMessages: Message[],
  incomingMessages: Message[]
): Message[] {
  const messageMap = new Map<string, Message>();
  const clientTempIdMap = new Map<string, string>(); // clientTempId -> serverId

  // First pass: index existing
  for (const msg of existingMessages) {
    messageMap.set(msg.id, msg);
    if (msg.clientTempId) {
      clientTempIdMap.set(msg.clientTempId, msg.id);
    }
  }

  // Second pass: merge incoming
  for (const incoming of incomingMessages) {
    // If incoming message matches an existing clientTempId, replace optimistic message
    if (incoming.clientTempId && clientTempIdMap.has(incoming.clientTempId)) {
      const existingServerId = clientTempIdMap.get(incoming.clientTempId)!;
      messageMap.delete(existingServerId);
    }

    messageMap.set(incoming.id, incoming);
    if (incoming.clientTempId) {
      clientTempIdMap.set(incoming.clientTempId, incoming.id);
    }
  }

  return Array.from(messageMap.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}
