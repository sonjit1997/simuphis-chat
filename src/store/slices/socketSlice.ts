import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

interface TypingUser {
  userId: string;
  userName: string;
}

interface SocketState {
  status: ConnectionStatus;
  typingMap: Record<string, TypingUser[]>;
  forwardModalMessageId: string | null;
}

const initialState: SocketState = {
  status: "disconnected",
  typingMap: {},
  forwardModalMessageId: null,
};

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.status = action.payload;
    },
    setTypingUsers: (
      state,
      action: PayloadAction<{
        conversationId: string;
        typingUsers: TypingUser[];
      }>
    ) => {
      const { conversationId, typingUsers } = action.payload;
      state.typingMap[conversationId] = typingUsers;
    },
    setForwardModalMessageId: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.forwardModalMessageId = action.payload;
    },
  },
});

export const {
  setConnectionStatus,
  setTypingUsers,
  setForwardModalMessageId,
} = socketSlice.actions;

export default socketSlice.reducer;
