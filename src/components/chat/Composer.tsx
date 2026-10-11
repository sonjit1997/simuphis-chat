"use client";

import { useTypingDebounce } from "@/hooks/useTypingDebounce";
import { socketService } from "@/services/socketService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveConversationId,
  selectActiveDraft,
} from "@/store/selectors/chatSelectors";
import { clearDraft, setDraft } from "@/store/slices/draftsSlice";
import { GroupedMessage } from "@/types/chat";
import { CURRENT_USER } from "@/mock/initialData";
import {
  AlertCircle,
  Paperclip,
  Send,
  Smile,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ComposerProps {
  onSendMessage: (
    content: string,
    replyToMessage?: GroupedMessage | null,
    mediaData?: { mediaUrl: string; fileName: string; type: "image" | "video"; fileSize: number }
  ) => void;
  replyingTo: GroupedMessage | null;
  onCancelReply: () => void;
  onUploadFile?: (file: File) => Promise<void>;
  onCancelUpload?: () => void;
  uploadProgress?: number | null;
  uploadStatus?: "idle" | "uploading" | "success" | "error";
  uploadError?: string | null;
}

export function Composer({
  onSendMessage,
  replyingTo,
  onCancelReply,
  onUploadFile,
  onCancelUpload,
  uploadProgress,
  uploadStatus,
  uploadError,
}: ComposerProps) {
  const dispatch = useAppDispatch();
  const activeConvId = useAppSelector(selectActiveConversationId);
  const activeDraft = useAppSelector(selectActiveDraft);

  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(activeDraft);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeConvId, activeDraft]);

  const { handleKeyPress, forceStop } = useTypingDebounce({
    onStartTyping: () => {
      if (activeConvId) {
        socketService.startTyping(activeConvId, CURRENT_USER.id, CURRENT_USER.name);
      }
    },
    onStopTyping: () => {
      if (activeConvId) {
        socketService.stopTyping(activeConvId, CURRENT_USER.id);
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    handleKeyPress();

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadFile) {
      await onUploadFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <footer className="p-4 bg-[#0f172a]/90 backdrop-blur-md border-t border-slate-800">
      {/* Upload Progress Bar with AbortController Cancel Support */}
      {uploadStatus === "uploading" && (
        <div
          data-testid="composer-upload-progress"
          className="mb-2.5 p-3 rounded-xl bg-slate-800/90 border border-indigo-500/30 text-xs"
        >
          <div className="flex items-center justify-between text-slate-300 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
              Uploading to Cloudinary...
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-indigo-400 font-bold">
                {uploadProgress ?? 0}%
              </span>
              {onCancelUpload && (
                <button
                  type="button"
                  onClick={onCancelUpload}
                  title="Cancel Upload (AbortController)"
                  aria-label="Cancel upload"
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-200"
              style={{ width: `${uploadProgress ?? 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Error Banner with Retry */}
      {uploadStatus === "error" && uploadError && (
        <div
          data-testid="composer-upload-error"
          className="mb-2.5 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            {uploadError}
          </span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-0.5 rounded bg-rose-600/40 text-white font-medium hover:bg-rose-600/60 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach image or video (Drag-and-Drop supported)"
            aria-label="Upload media to Cloudinary"
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
            aria-label="Message input box"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 px-3 py-1 resize-none focus:outline-none max-h-32"
          />

          <button
            type="button"
            title="Emoji picker"
            aria-label="Emoji picker"
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || uploadStatus === "uploading"}
          aria-label="Send message"
          className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </footer>
  );
}
