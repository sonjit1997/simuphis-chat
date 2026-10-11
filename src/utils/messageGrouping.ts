import { GroupedMessage, Message } from "@/types/chat";

const GROUPING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes threshold

/**
 * Pure function to calculate grouped message indicators.
 * Extracted and improved from wydChat's useGroupedMessages.js.
 */
export function groupMessages(messages: Message[]): GroupedMessage[] {
  if (!messages || messages.length === 0) return [];

  return messages.map((current, index) => {
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const isPrevSameSender =
      prev &&
      prev.senderId === current.senderId &&
      Math.abs(
        new Date(current.createdAt).getTime() -
          new Date(prev.createdAt).getTime()
      ) < GROUPING_THRESHOLD_MS;

    const isNextSameSender =
      next &&
      next.senderId === current.senderId &&
      Math.abs(
        new Date(next.createdAt).getTime() -
          new Date(current.createdAt).getTime()
      ) < GROUPING_THRESHOLD_MS;

    return {
      ...current,
      isFirstOfGroup: !isPrevSameSender,
      isLastOfGroup: !isNextSameSender,
    };
  });
}
