"use client";

import { useTypingDebounce } from "@/hooks/useTypingDebounce";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveConversationId,
  selectActiveDraft,
} from "@/store/selectors/chatSelectors";
import { clearDraft, setDraft } from "@/store/slices/draftsSlice";
import { GroupedMessage } from "@/types/chat";
import { Paperclip, Send, Smile, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ComposerProps {
  onSendMessage: (content: string, replyToMessage?: GroupedMessage | null) => void;
  replyingTo: GroupedMessage | null;
  onCancelReply: () => void;
  onOpenAttachment?: () => void;
}

export function Composer({
  onSendMessage,
  replyingTo,
  onCancelReply,
  onOpenAttachment,
}: ComposerProps) {
  const dispatch = useAppDispatch();
  const activeConvId = useAppSelector(selectActiveConversationId);
  const activeDraft = useAppSelector(selectActiveDraft);

  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync draft from Redux / LocalStorage when active conversation changes
  useEffect(() => {
    setText(activeDraft);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeConvId, activeDraft]);

  const { handleKeyPress, forceStop } = useTypingDebounce({
    onStartTyping: () => {
      // Socket typing emit will hook here in Phase 3
    },
    onStopTyping: () => {
      // Socket stopTyping emit will hook here in Phase 3
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    handleKeyPress();

    // Persist draft in Redux & localStorage
    if (activeConvId) {
      dispatch(setDraft({ conversationId: activeConvId, text: val }));
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    forceStop();
    onSendMessage(trimmed, replyingTo);
    setText("");

    if (activeConvId) {
      dispatch(clearDraft(activeConvId));
    }
    if (replyingTo) {
      onCancelReply();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <footer className="p-4 bg-[#0f172a]/90 backdrop-blur-md border-t border-slate-800">
      {/* Replying Banner */}
      {replyingTo && (
        <div className="mb-2.5 p-2 rounded-lg bg-slate-800/90 border border-indigo-500/30 flex items-center justify-between text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="border-l-2 border-indigo-400 pl-2">
            <span className="font-semibold text-indigo-300 block">
              Replying to {replyingTo.senderName}
            </span>
            <span className="text-slate-400 line-clamp-1">
              {replyingTo.content}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSend} className="flex items-end gap-2">
        <div className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl flex items-center px-3 py-1.5 focus-within:border-indigo-500/60 transition-colors shadow-inner">
          <button
            type="button"
            onClick={onOpenAttachment}
            title="Attach file or media"
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 px-3 py-1 resize-none focus:outline-none max-h-32"
          />

          <button
            type="button"
            title="Emoji picker"
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Send message"
          className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </footer>
  );
}
