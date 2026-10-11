"use client";

import { GroupedMessage } from "@/types/chat";
import { formatMessageTime } from "@/utils/dateFormatters";
import { Check, CheckCheck, Clock, CornerUpLeft, Share2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

interface MessageItemProps {
  message: GroupedMessage;
  isCurrentUser: boolean;
  onReply?: (message: GroupedMessage) => void;
  onForward?: (message: GroupedMessage) => void;
}

export function MessageItem({
  message,
  isCurrentUser,
  onReply,
  onForward,
}: MessageItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", message.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group flex flex-col ${
        isCurrentUser ? "items-end" : "items-start"
      } ${message.isFirstOfGroup ? "mt-3" : "mt-0.5"} ${
        isDragging ? "dragging-message" : ""
      } relative transition-opacity`}
    >
      {/* Sender Header for Group or first message */}
      {message.isFirstOfGroup && !isCurrentUser && (
        <span className="text-[11px] font-semibold text-indigo-400 mb-1 ml-2">
          {message.senderName}
        </span>
      )}

      {/* Message Card */}
      <div className="relative max-w-[75%] md:max-w-[65%] flex items-center">
        {/* Accessible Quick Actions Hover Bar */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 shadow-lg z-20 ${
            isCurrentUser ? "-left-20" : "-right-20"
          }`}
        >
          <button
            onClick={() => onReply && onReply(message)}
            title="Reply (Accessible alternative)"
            aria-label="Reply to message"
            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onForward && onForward(message)}
            title="Forward (Accessible keyboard alternative)"
            aria-label="Forward message"
            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words relative ${
            isCurrentUser
              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm"
              : "bg-slate-800/90 text-slate-100 border border-slate-700/50 rounded-tl-sm"
          }`}
        >
          {/* Reply Context Banner */}
          {message.repliedToMessage && (
            <div className="mb-2 p-2 rounded bg-black/20 border-l-2 border-indigo-300 text-xs text-slate-200">
              <p className="font-semibold text-[11px] text-indigo-200 mb-0.5">
                {message.repliedToMessage.senderName}
              </p>
              <p className="line-clamp-1 opacity-80">
                {message.repliedToMessage.content}
              </p>
            </div>
          )}

          {/* Media Content */}
          {message.type === "image" && message.mediaUrl && (
            <div className="mb-2 rounded-lg overflow-hidden border border-black/20">
              <Image
                src={message.mediaUrl}
                alt={message.fileName || "Shared image"}
                width={400}
                height={260}
                className="w-full h-auto object-cover max-h-72"
              />
            </div>
          )}

          {message.type === "video" && message.mediaUrl && (
            <div className="mb-2 rounded-lg overflow-hidden border border-black/20">
              <video
                src={message.mediaUrl}
                controls
                className="w-full max-h-72 rounded-lg"
              />
            </div>
          )}

          {/* Text Content */}
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

          {/* Metadata Footer */}
          <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] opacity-75 font-mono">
            {message.isForwarded && (
              <span className="italic mr-1 text-slate-300">Forwarded</span>
            )}
            <span>{formatMessageTime(message.createdAt)}</span>

            {isCurrentUser && (
              <span>
                {message.status === "sending" && (
                  <Clock className="w-3 h-3 text-amber-300 animate-spin" />
                )}
                {message.status === "sent" && <Check className="w-3 h-3" />}
                {message.status === "delivered" && (
                  <CheckCheck className="w-3 h-3 text-sky-300" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
