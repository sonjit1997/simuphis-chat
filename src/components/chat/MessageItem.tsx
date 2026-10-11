"use client";

import { GroupedMessage } from "@/types/chat";
import { formatMessageTime } from "@/utils/dateFormatters";
import { Check, CheckCheck, Clock, CornerUpLeft, Share2 } from "lucide-react";
import { motion } from "framer-motion";
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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", message.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`group flex flex-col ${
        isCurrentUser ? "items-end" : "items-start"
      } ${message.isFirstOfGroup ? "mt-3" : "mt-0.5"} relative transition-opacity`}
    >
      {/* Sender Header for Group or first message */}
      {message.isFirstOfGroup && !isCurrentUser && (
        <span className="text-[11px] font-semibold text-indigo-400 mb-1 ml-2 select-none">
          {message.senderName}
        </span>
      )}

      {/* Message Card & Draggable Container */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`relative max-w-[78%] md:max-w-[68%] flex items-center cursor-grab active:cursor-grabbing ${
          isDragging ? "dragging-message" : ""
        }`}
      >
        {/* Accessible Quick Actions Hover Bar */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-slate-900/95 border border-slate-700/80 rounded-xl p-1 shadow-xl z-20 backdrop-blur-md ${
            isCurrentUser ? "-left-20" : "-right-20"
          }`}
        >
          <button
            onClick={() => onReply && onReply(message)}
            title="Reply (Accessible alternative)"
            aria-label="Reply to message"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onForward && onForward(message)}
            title="Forward (Accessible keyboard alternative)"
            aria-label="Forward message"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-md text-sm break-words relative transition-all duration-150 ${
            isCurrentUser
              ? "bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white rounded-tr-sm"
              : "bg-slate-800/95 text-slate-100 border border-slate-700/60 rounded-tl-sm backdrop-blur-sm"
          } ${isDragging ? "ring-2 ring-indigo-400 shadow-indigo-500/30" : ""}`}
        >
          {/* Forwarded Header Badge */}
          {message.isForwarded && (
            <div className="mb-1 flex items-center gap-1 text-[11px] text-indigo-200/90 font-medium">
              <Share2 className="w-3 h-3 text-indigo-300" />
              <span>Forwarded message</span>
            </div>
          )}

          {/* Reply Context Banner */}
          {message.repliedToMessage && (
            <div className="mb-2 p-2 rounded-xl bg-black/25 border-l-2 border-indigo-300 text-xs text-slate-200">
              <p className="font-semibold text-[11px] text-indigo-200 mb-0.5">
                {message.repliedToMessage.senderName}
              </p>
              <p className="line-clamp-1 opacity-80">
                {message.repliedToMessage.content}
              </p>
            </div>
          )}

          {/* Media Content - Cloudinary Image */}
          {message.type === "image" && message.mediaUrl && (
            <div className="mb-2 rounded-xl overflow-hidden border border-black/20 bg-slate-900 shadow-inner">
              <Image
                src={message.mediaUrl}
                alt={message.fileName || "Shared media"}
                width={480}
                height={320}
                className="w-full h-auto object-cover max-h-80 hover:scale-[1.01] transition-transform duration-200 cursor-pointer"
                unoptimized
              />
              {message.fileName && (
                <div className="px-2 py-1 text-[11px] bg-slate-950/70 text-slate-300 truncate">
                  {message.fileName}
                </div>
              )}
            </div>
          )}

          {/* Media Content - Cloudinary Video */}
          {message.type === "video" && message.mediaUrl && (
            <div className="mb-2 rounded-xl overflow-hidden border border-black/20 bg-black shadow-inner">
              <video
                src={message.mediaUrl}
                controls
                playsInline
                className="w-full max-h-80 rounded-xl"
              />
              {message.fileName && (
                <div className="px-2 py-1 text-[11px] bg-slate-950/70 text-slate-300 truncate">
                  {message.fileName}
                </div>
              )}
            </div>
          )}

          {/* Text Content */}
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

          {/* Metadata Footer */}
          <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] opacity-80 font-mono">
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
    </motion.div>
  );
}
