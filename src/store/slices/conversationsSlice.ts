import { Conversation } from "@/types/chat";
import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

export const conversationsAdapter = createEntityAdapter<Conversation>({
  sortComparer: (a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
});

interface ConversationsState {
  activeConversationId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState = conversationsAdapter.getInitialState<ConversationsState>({
  activeConversationId: null,
  status: "idle",
  error: null,
});

export const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      conversationsAdapter.setAll(state, action.payload);
      state.status = "succeeded";
    },
    upsertConversation: (state, action: PayloadAction<Conversation>) => {
      conversationsAdapter.upsertOne(state, action.payload);
    },
    setActiveConversationId: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
      const conv = state.entities[action.payload];
      if (conv) {
        conv.unreadCount = 0;
      }
    },
    updateLastMessage: (
      state,
      action: PayloadAction<{
        conversationId: string;
        lastMessage: Conversation["lastMessage"];
        incrementUnread?: boolean;
      }>
    ) => {
      const { conversationId, lastMessage, incrementUnread } = action.payload;
      const conv = state.entities[conversationId];
      if (conv && lastMessage) {
        conv.lastMessage = lastMessage;
        conv.updatedAt = lastMessage.createdAt;
        if (
          incrementUnread &&
          state.activeConversationId !== conversationId
        ) {
          conv.unreadCount += 1;
        }
      }
    },
  },
});

export const {
  setConversations,
  upsertConversation,
  setActiveConversationId,
  updateLastMessage,
} = conversationsSlice.actions;

export default conversationsSlice.reducer;
