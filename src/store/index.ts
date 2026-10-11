import conversationsReducer from "./slices/conversationsSlice";
import draftsReducer from "./slices/draftsSlice";
import messagesReducer from "./slices/messagesSlice";
import socketReducer from "./slices/socketSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    conversations: conversationsReducer,
    messages: messagesReducer,
    drafts: draftsReducer,
    socket: socketReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
