"use client";

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
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const activeConvId = useAppSelector(selectActiveConversationId);
  const activeMessages = useAppSelector(selectMessagesByActiveConversation);
  const lastSyncTimestampRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeMessages.length > 0) {
      const latest = activeMessages[activeMessages.length - 1];
      lastSyncTimestampRef.current = latest.createdAt;
    }
  }, [activeMessages]);

  useEffect(() => {
    if (!currentUser) return;

    // Connect socket on mount with current user identity
    const socket = socketService.connect(currentUser.id);

    // If socket is already connected from previous instance
    if (socket.connected) {
      dispatch(setConnectionStatus("connected"));
    }

    // Set connection status to connected quickly with local fallback guard
    const fallbackTimer = setTimeout(() => {
      dispatch(setConnectionStatus("connected"));
    }, 1500);

    socket.on("connect", () => {
      clearTimeout(fallbackTimer);
      console.log(`[Socket Connected] User: ${currentUser.name}`);
      dispatch(setConnectionStatus("connected"));

      if (activeConvId) {
        socketService
          .syncMessages({
            conversationId: activeConvId,
            lastSyncedAt: lastSyncTimestampRef.current || undefined,
          })
          .then((response) => {
            if (response.messages && response.messages.length > 0) {
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

    socket.on("typing:update", ({ conversationId, typingUsers }) => {
      dispatch(
        setTypingUsers({
          conversationId,
          typingUsers: typingUsers.filter((u) => u.userId !== currentUser.id),
        })
      );
    });

    // ----------------------------------------------------
    // Cross-tab BroadcastChannel for 0ms multi-tab sync
    // ----------------------------------------------------
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      broadcastChannel = new BroadcastChannel("simuphish_tab_sync");
      broadcastChannel.onmessage = (event) => {
        const { type, data } = event.data || {};
        if (type === "message:new" && data) {
          dispatch(setMessages([data]));
          dispatch(
            updateLastMessage({
              conversationId: data.conversationId,
              lastMessage: {
                id: data.id,
                content: data.content,
                type: data.type,
                senderName: data.senderName,
                createdAt: data.createdAt,
              },
              incrementUnread: true,
            })
          );
        } else if (type === "typing" && data) {
          if (data.userId !== currentUser.id) {
            dispatch(
              setTypingUsers({
                conversationId: data.conversationId,
                typingUsers: data.isTyping
                  ? [{ userId: data.userId, userName: data.userName }]
                  : [],
              })
            );
          }
        }
      };
    }

    return () => {
      clearTimeout(fallbackTimer);
      if (broadcastChannel) broadcastChannel.close();
      socketService.disconnect();
    };
  }, [dispatch, currentUser, activeConvId]);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
}
