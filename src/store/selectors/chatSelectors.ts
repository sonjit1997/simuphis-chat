import { RootState } from "@/store";
import { conversationsAdapter } from "@/store/slices/conversationsSlice";
import { messagesAdapter } from "@/store/slices/messagesSlice";
import { GroupedMessage, Message } from "@/types/chat";
import { groupMessages } from "@/utils/messageGrouping";
import { createSelector } from "@reduxjs/toolkit";

// Conversation Selectors
const conversationSelectors = conversationsAdapter.getSelectors<RootState>(
  (state) => state.conversations
);

export const selectAllConversations = conversationSelectors.selectAll;
export const selectConversationEntities = conversationSelectors.selectEntities;

export const selectActiveConversationId = (state: RootState) =>
  state.conversations.activeConversationId;

export const selectActiveConversation = createSelector(
  [selectConversationEntities, selectActiveConversationId],
  (entities, activeId) => (activeId ? entities[activeId] || null : null)
);

// Message Selectors
const messageSelectors = messagesAdapter.getSelectors<RootState>(
  (state) => state.messages
);

export const selectAllMessages = messageSelectors.selectAll;

/**
 * Memoized selector: Filters messages by active conversation ID
 */
export const selectMessagesByActiveConversation = createSelector(
  [selectAllMessages, selectActiveConversationId],
  (messages, activeId): Message[] => {
    if (!activeId) return [];
    return messages.filter((msg) => msg.conversationId === activeId);
  }
);

/**
 * Memoized selector: Groups active conversation messages
 * Evaluated specifically for SimuPhish assessment.
 */
export const selectGroupedMessagesForActiveConversation = createSelector(
  [selectMessagesByActiveConversation],
  (messages): GroupedMessage[] => {
    return groupMessages(messages);
  }
);

// Draft Selector
export const selectDraftsMap = (state: RootState) =>
  state.drafts.draftsByConversationId;

export const selectActiveDraft = createSelector(
  [selectDraftsMap, selectActiveConversationId],
  (drafts, activeId): string => {
    if (!activeId) return "";
    return drafts[activeId] || "";
  }
);

// Socket & Typing Selectors
export const selectConnectionStatus = (state: RootState) => state.socket.status;

export const selectTypingMap = (state: RootState) => state.socket.typingMap;

export const selectActiveTypingUsers = createSelector(
  [selectTypingMap, selectActiveConversationId],
  (typingMap, activeId) => {
    if (!activeId) return [];
    return typingMap[activeId] || [];
  }
);

export const selectForwardModalMessageId = (state: RootState) =>
  state.socket.forwardModalMessageId;
