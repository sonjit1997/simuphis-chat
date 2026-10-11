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
import { GroupedMessage, Message, MessageType } from "@/types/chat";
import React, { useCallback, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { Composer } from "./Composer";
import { ForwardModal } from "./ForwardModal";
import { MediaUploadOverlay } from "./MediaUploadOverlay";
import { MessageList } from "./MessageList";

interface ChatContainerProps {
  conversationId: string;
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const dispatch = useAppDispatch();
  const [replyingTo, setReplyingTo] = useState<GroupedMessage | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File Upload Pipeline to /api/upload (Cloudinary storage)
  const handleUploadFile = useCallback(
    async (file: File) => {
      setUploadStatus("uploading");
      setUploadProgress(10);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        // Progress simulation
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => (prev && prev < 85 ? prev + 15 : prev));
        }, 200);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Upload failed");
        }

        const data = await response.json();
        setUploadProgress(100);
        setUploadStatus("success");

        // Immediately send uploaded media over WebSocket
        await handleSendMessage(
          file.name,
          null,
          {
            mediaUrl: data.mediaUrl,
            fileName: data.fileName,
            type: data.type as MessageType,
            fileSize: data.fileSize,
          }
        );

        setTimeout(() => {
          setUploadStatus("idle");
          setUploadProgress(null);
        }, 1200);
      } catch (err: any) {
        console.error("[Upload Error]:", err);
        setUploadStatus("error");
        setUploadError(err.message || "Failed to upload file");
      }
    },
    [conversationId]
  );

  // Drag-and-drop file listeners for chat viewport
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleUploadFile(droppedFiles[0]);
    }
  };

  const handleSendMessage = async (
    content: string,
    replyToMessage?: GroupedMessage | null,
    mediaData?: { mediaUrl: string; fileName: string; type: MessageType; fileSize: number }
  ) => {
    const tempId = "client-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

    const messageType: MessageType = mediaData ? mediaData.type : "text";

    const optimisticMsg: Message = {
      id: tempId,
      clientTempId: tempId,
      conversationId,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      senderAvatar: CURRENT_USER.avatarUrl,
      type: messageType,
      content,
      mediaUrl: mediaData?.mediaUrl,
      fileName: mediaData?.fileName,
      fileSize: mediaData?.fileSize,
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

    dispatch(addOptimisticMessage(optimisticMsg));
    dispatch(
      updateLastMessage({
        conversationId,
        lastMessage: {
          id: tempId,
          content: messageType === "text" ? content : `Shared ${messageType}`,
          type: messageType,
          senderName: CURRENT_USER.name,
          createdAt: optimisticMsg.createdAt,
        },
      })
    );

    const ack = await socketService.sendMessage({
      clientTempId: tempId,
      conversationId,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      type: messageType,
      content,
      mediaUrl: mediaData?.mediaUrl,
      fileName: mediaData?.fileName,
      fileSize: mediaData?.fileSize,
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
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 h-screen flex flex-col bg-[#070b13] relative overflow-hidden"
    >
      <MediaUploadOverlay isDraggingOver={isDraggingOver} />
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
        onUploadFile={handleUploadFile}
        uploadProgress={uploadProgress}
        uploadStatus={uploadStatus}
        uploadError={uploadError}
      />
      <ForwardModal onForwardConfirm={handleForwardConfirm} />
    </div>
  );
}
