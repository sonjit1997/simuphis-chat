"use client";

import { CURRENT_USER } from "@/mock/initialData";
import { useAppDispatch } from "@/store/hooks";
import {
  addOptimisticMessage,
  confirmMessageSent,
} from "@/store/slices/messagesSlice";
import { updateLastMessage } from "@/store/slices/conversationsSlice";
import { setForwardModalMessageId } from "@/store/slices/socketSlice";
import { GroupedMessage, Message } from "@/types/chat";
import React, { useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { Composer } from "./Composer";
import { ForwardModal } from "./ForwardModal";
import { MessageList } from "./MessageList";

interface ChatContainerProps {
  conversationId: string;
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const dispatch = useAppDispatch();
  const [replyingTo, setReplyingTo] = useState<GroupedMessage | null>(null);

  const handleSendMessage = (
    content: string,
    replyToMessage?: GroupedMessage | null
  ) => {
    const tempId = "temp-" + Date.now();
    const newMsg: Message = {
      id: tempId,
      clientTempId: tempId,
      conversationId,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      senderAvatar: CURRENT_USER.avatarUrl,
      type: "text",
      content,
      createdAt: new Date().toISOString(),
      status: "sending",
      replyToId: replyToMessage?.id || null,
      repliedToMessage: replyToMessage
        ? {
            id: replyToMessage.id,
            senderName: replyToMessage.senderName,
            content: replyToMessage.content,
            type: replyToMessage.type,
          }
        : null,
    };

    // 1. Optimistic Update to Redux
    dispatch(addOptimisticMessage(newMsg));
    dispatch(
      updateLastMessage({
        conversationId,
        lastMessage: {
          id: tempId,
          content,
          type: "text",
          senderName: CURRENT_USER.name,
          createdAt: newMsg.createdAt,
        },
      })
    );

    // 2. Simulated Ack for Phase 2 UI test (Will wire socket in Phase 3)
    setTimeout(() => {
      dispatch(
        confirmMessageSent({
          clientTempId: tempId,
          serverMessage: { ...newMsg, id: "msg-" + Date.now(), status: "delivered" },
        })
      );
    }, 600);
  };

  const handleForwardDrop = (targetConversationId: string, messageId: string) => {
    console.log(`Forwarding message ${messageId} to conversation ${targetConversationId}`);
  };

  return (
    <div className="flex-1 h-screen flex flex-col bg-[#070b13] relative overflow-hidden">
      <ChatHeader />
      <MessageList
        currentUserId={CURRENT_USER.id}
        onReply={(msg) => setReplyingTo(msg)}
        onForward={(msg) => dispatch(setForwardModalMessageId(msg.id))}
      />
      <Composer
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
      <ForwardModal onForwardConfirm={handleForwardDrop} />
    </div>
  );
}
