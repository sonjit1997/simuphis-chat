import { Message } from "@/types/chat";
import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

export const messagesAdapter = createEntityAdapter<Message>({
  sortComparer: (a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
});

interface MessagesState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState = messagesAdapter.getInitialState<MessagesState>({
  status: "idle",
  error: null,
});

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      for (const msg of action.payload) {
        if (msg.clientTempId && state.entities[msg.clientTempId]) {
          messagesAdapter.removeOne(state, msg.clientTempId);
        }
      }
      messagesAdapter.upsertMany(state, action.payload);
      state.status = "succeeded";
    },
    addOptimisticMessage: (state, action: PayloadAction<Message>) => {
      messagesAdapter.addOne(state, action.payload);
    },
    confirmMessageSent: (
      state,
      action: PayloadAction<{
        clientTempId: string;
        serverMessage: Message;
      }>
    ) => {
      const { clientTempId, serverMessage } = action.payload;
      if (clientTempId && state.entities[clientTempId]) {
        messagesAdapter.removeOne(state, clientTempId);
      }
      messagesAdapter.upsertOne(state, {
        ...serverMessage,
        status: "delivered",
      });
    },
    markMessageFailed: (state, action: PayloadAction<string>) => {
      const msg = state.entities[action.payload];
      if (msg) {
        msg.status = "failed";
      }
    },
  },
});

export const {
  setMessages,
  addOptimisticMessage,
  confirmMessageSent,
  markMessageFailed,
} = messagesSlice.actions;

export default messagesSlice.reducer;
