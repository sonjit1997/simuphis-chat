"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAllConversations,
  selectForwardModalMessageId,
} from "@/store/selectors/chatSelectors";
import { setForwardModalMessageId } from "@/store/slices/socketSlice";
import { Check, Share2, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface ForwardModalProps {
  onForwardConfirm: (targetConversationId: string, messageId: string) => void;
}

export function ForwardModal({ onForwardConfirm }: ForwardModalProps) {
  const dispatch = useAppDispatch();
  const forwardMessageId = useAppSelector(selectForwardModalMessageId);
  const conversations = useAppSelector(selectAllConversations);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch(setForwardModalMessageId(null));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  if (!forwardMessageId) return null;

  const handleConfirm = () => {
    if (selectedTargetId && forwardMessageId) {
      onForwardConfirm(selectedTargetId, forwardMessageId);
      dispatch(setForwardModalMessageId(null));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="forward-dialog-title"
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h2 id="forward-dialog-title" className="text-sm font-semibold text-white">
              Forward Message
            </h2>
          </div>
          <button
            onClick={() => dispatch(setForwardModalMessageId(null))}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 max-h-72 overflow-y-auto space-y-1">
          <p className="text-xs text-slate-400 mb-2 px-1">
            Select target conversation:
          </p>
          {conversations.map((conv) => {
            const isSelected = selectedTargetId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedTargetId(conv.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                  isSelected
                    ? "bg-indigo-600/20 border border-indigo-500/50 text-white"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800">
                    {conv.avatarUrl && (
                      <Image
                        src={conv.avatarUrl}
                        alt={conv.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium">{conv.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={() => dispatch(setForwardModalMessageId(null))}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            disabled={!selectedTargetId}
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl shadow"
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}
