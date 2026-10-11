"use client";

import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { useAppSelector } from "@/store/hooks";
import { selectGroupedMessagesForActiveConversation } from "@/store/selectors/chatSelectors";
import { GroupedMessage } from "@/types/chat";
import { formatDayDivider } from "@/utils/dateFormatters";
import { AlertCircle, Loader2, MessageSquare, RefreshCw } from "lucide-react";
import React, { useRef } from "react";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  currentUserId: string;
  onReply: (message: GroupedMessage) => void;
  onForward: (message: GroupedMessage) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function MessageList({
  currentUserId,
  onReply,
  onForward,
  isLoading,
  error,
  onRetry,
}: MessageListProps) {
  const messages = useAppSelector(selectGroupedMessagesForActiveConversation);
  const containerRef = useRef<HTMLDivElement>(null);

  useScrollToBottom(containerRef, messages.length);

  // 1. Loading State (Explicit assessment requirement)
  if (isLoading) {
    return (
      <div
        data-testid="message-list-loading"
        className="flex-1 flex flex-col items-center justify-center p-8 space-y-3 text-slate-400"
      >
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-medium">Loading message history...</p>
      </div>
    );
  }

  // 2. Error State with Retry (Explicit assessment requirement)
  if (error) {
    return (
      <div
        data-testid="message-list-error"
        className="flex-1 flex flex-col items-center justify-center p-8 text-center text-rose-300"
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3 text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-rose-200 mb-1">
          Failed to load messages
        </h3>
        <p className="text-xs text-rose-300/80 max-w-xs mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-200 text-xs font-medium hover:bg-rose-600/30 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
      </div>
    );
  }

  // 3. Empty State (Explicit assessment requirement)
  if (messages.length === 0) {
    return (
      <div
        data-testid="message-list-empty"
        className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500"
      >
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

  // 4. Successful Message Stream
  return (
    <div
      ref={containerRef}
      data-testid="message-list-content"
      className="flex-1 overflow-y-auto px-6 py-4 space-y-1"
    >
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === currentUserId;
        const prevMessage = messages[index - 1];

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
