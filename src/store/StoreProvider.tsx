"use client";

import { store } from "@/store";
import { setCurrentUser } from "@/store/slices/authSlice";
import { setConversations } from "@/store/slices/conversationsSlice";
import { setMessages } from "@/store/slices/messagesSlice";
import { Conversation, Message } from "@/types/chat";
import React, { useEffect } from "react";
import { Provider } from "react-redux";

interface StoreProviderProps {
  children: React.ReactNode;
  initialConversations?: Conversation[];
  initialMessages?: Message[];
}

export function StoreProvider({
  children,
  initialConversations,
  initialMessages,
}: StoreProviderProps) {
  useEffect(() => {
    // Rehydrate session safely on client mount after hydration
    try {
      const hasSessionCookie = document.cookie.includes("simuphish_session=");
      const saved = localStorage.getItem("simuphish_user_session");
      if (hasSessionCookie && saved) {
        store.dispatch(setCurrentUser(JSON.parse(saved)));
      }
    } catch {}

    if (initialConversations && initialConversations.length > 0) {
      store.dispatch(setConversations(initialConversations));
    }
    if (initialMessages && initialMessages.length > 0) {
      store.dispatch(setMessages(initialMessages));
    }
  }, [initialConversations, initialMessages]);

  return <Provider store={store}>{children}</Provider>;
}
