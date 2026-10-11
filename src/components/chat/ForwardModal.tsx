"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAllConversations,
  selectForwardModalMessageId,
} from "@/store/selectors/chatSelectors";
import { setForwardModalMessageId } from "@/store/slices/socketSlice";
import { getConversationDisplayMeta } from "@/utils/conversationUtils";
import { Check, Send, Share2, Users, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

interface ForwardModalProps {
  onForwardConfirm: (targetConversationId: string, messageId: string) => void;
}

export function ForwardModal({ onForwardConfirm }: ForwardModalProps) {
  const dispatch = useAppDispatch();
  const forwardMessageId = useAppSelector(selectForwardModalMessageId);
  const conversations = useAppSelector(selectAllConversations);
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

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
            <h2 id="forward-dialog-title" className="text-sm font-semibold text-slate-100">
              Forward Message
            </h2>
          </div>
          <button
            onClick={() => dispatch(setForwardModalMessageId(null))}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
          <p className="text-xs text-slate-400 mb-2">
            Select a contact or channel to forward to:
          </p>

          {conversations.map((conv) => {
            const meta = getConversationDisplayMeta(conv, currentUser);
            const isSelected = selectedTargetId === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => setSelectedTargetId(conv.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600/15 border-indigo-500 text-white"
                    : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700/60">
                    {meta.avatarUrl ? (
                      <Image
                        src={meta.avatarUrl}
                        alt={meta.name}
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 text-xs">
                        {meta.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-200">
                      {meta.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {meta.isGroup ? "Group Channel" : "Direct Message"}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500 text-white"
                      : "border-slate-700 group-hover:border-slate-600"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end gap-2.5">
          <button
            onClick={() => dispatch(setForwardModalMessageId(null))}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTargetId}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/30"
          >
            <Send className="w-3.5 h-3.5" />
            Forward Now
          </button>
        </div>
      </div>
    </div>
  );
}
