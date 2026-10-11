"use client";

import { CURRENT_USER } from "@/mock/initialData";
import { socketService } from "@/services/socketService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveConversationId,
  selectMessagesByActiveConversation,
} from "@/store/selectors/chatSelectors";
import { updateLastMessage } from "@/store/slices/conversationsSlice";
import { setMessages } from "@/store/slices/messagesSlice";
import { setConnectionStatus, setTypingUsers } from "@/store/slices/socketSlice";
import React, { createContext, useContext, useEffect, useRef } from "react";

const SocketContext = createContext<typeof socketService | null>(null);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const activeConvId = useAppSelector(selectActiveConversationId);
  const activeMessages = useAppSelector(selectMessagesByActiveConversation);
  const lastSyncTimestampRef = useRef<string | null>(null);

  // Keep track of newest message timestamp for reconnect gap recovery
  useEffect(() => {
    if (activeMessages.length > 0) {
      const latest = activeMessages[activeMessages.length - 1];
      lastSyncTimestampRef.current = latest.createdAt;
    }
  }, [activeMessages]);

  useEffect(() => {
    // Connect socket on mount
    const socket = socketService.connect(CURRENT_USER.id);

    // Connection lifecycle events
    socket.on("connect", () => {
      console.log("[Socket Connected]");
      dispatch(setConnectionStatus("connected"));

      // Reconnect gap recovery: retrieve any missed messages while disconnected
      if (activeConvId) {
        socketService
          .syncMessages({
            conversationId: activeConvId,
            lastSyncedAt: lastSyncTimestampRef.current || undefined,
          })
          .then((response) => {
            if (response.messages && response.messages.length > 0) {
              console.log(`[Recovery] Merged ${response.messages.length} messages`);
              dispatch(setMessages(response.messages));
            }
          });
      }
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Socket Disconnected]:", reason);
      dispatch(setConnectionStatus("disconnected"));
    });

    socket.io.on("reconnect_attempt", () => {
      dispatch(setConnectionStatus("connecting"));
    });

    // Real-Time Incoming Message Listener
    socket.on("message:new", (message) => {
      dispatch(setMessages([message]));
      dispatch(
        updateLastMessage({
          conversationId: message.conversationId,
          lastMessage: {
            id: message.id,
            content: message.content,
            type: message.type,
            senderName: message.senderName,
            createdAt: message.createdAt,
          },
          incrementUnread: true,
        })
      );
    });

    // Real-Time Typing Listener
    socket.on("typing:update", ({ conversationId, typingUsers }) => {
      dispatch(
        setTypingUsers({
          conversationId,
          typingUsers: typingUsers.filter((u) => u.userId !== CURRENT_USER.id),
        })
      );
    });

    return () => {
      socketService.disconnect();
    };
  }, [dispatch, activeConvId]);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
}
