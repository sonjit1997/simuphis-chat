"use client";

import { CURRENT_USER } from "@/mock/initialData";
import { socketService } from "@/services/socketService";
import { useAppDispatch } from "@/store/hooks";
import { updateLastMessage } from "@/store/slices/conversationsSlice";
import {
  addOptimisticMessage,
  confirmMessageSent,
  markMessageFailed,
} from "@/store/slices/messagesSlice";
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

  const handleSendMessage = async (
    content: string,
    replyToMessage?: GroupedMessage | null
  ) => {
    const tempId = "client-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

    const optimisticMsg: Message = {
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

    // 1. Optimistic Update to Redux Store immediately
    dispatch(addOptimisticMessage(optimisticMsg));
    dispatch(
      updateLastMessage({
        conversationId,
        lastMessage: {
          id: tempId,
          content,
          type: "text",
          senderName: CURRENT_USER.name,
          createdAt: optimisticMsg.createdAt,
        },
      })
    );

    // 2. Dispatch via WebSocket Transport with Acknowledgment
    const ack = await socketService.sendMessage({
      clientTempId: tempId,
      conversationId,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      type: "text",
      content,
      replyToId: replyToMessage?.id || null,
    });

    if (ack.success && ack.message) {
      dispatch(
        confirmMessageSent({
          clientTempId: tempId,
          serverMessage: ack.message,
        })
      );
    } else {
      console.error("[Send Message Failed]:", ack.error);
      dispatch(markMessageFailed(tempId));
    }
  };

  const handleForwardConfirm = async (
    targetConversationId: string,
    originalMessageId: string
  ) => {
    const tempId = "fwd-" + Date.now();
    await socketService.forwardMessage({
      clientTempId: tempId,
      targetConversationId,
      originalMessageId,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
    });
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
      <ForwardModal onForwardConfirm={handleForwardConfirm} />
    </div>
  );
}
