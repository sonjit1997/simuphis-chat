"use client";

import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { useAppSelector } from "@/store/hooks";
import { selectGroupedMessagesForActiveConversation } from "@/store/selectors/chatSelectors";
import { GroupedMessage } from "@/types/chat";
import { formatDayDivider } from "@/utils/dateFormatters";
import { MessageSquare } from "lucide-react";
import React, { useRef } from "react";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  currentUserId: string;
  onReply: (message: GroupedMessage) => void;
  onForward: (message: GroupedMessage) => void;
}

export function MessageList({
  currentUserId,
  onReply,
  onForward,
}: MessageListProps) {
  const messages = useAppSelector(selectGroupedMessagesForActiveConversation);
  const containerRef = useRef<HTMLDivElement>(null);

  useScrollToBottom(containerRef, messages.length);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-sm font-medium text-slate-300 mb-1">
          No messages yet
        </h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Send a greeting or drag-and-drop media to start this conversation.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-1"
    >
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === currentUserId;
        const prevMessage = messages[index - 1];

        // Day divider check
        const showDayDivider =
          !prevMessage ||
          new Date(message.createdAt).toDateString() !==
            new Date(prevMessage.createdAt).toDateString();

        return (
          <React.Fragment key={message.id}>
            {showDayDivider && (
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-slate-800/80" />
                <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 rounded-full">
                  {formatDayDivider(message.createdAt)}
                </span>
                <div className="flex-1 border-t border-slate-800/80" />
              </div>
            )}

            <MessageItem
              message={message}
              isCurrentUser={isCurrentUser}
              onReply={onReply}
              onForward={onForward}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}
