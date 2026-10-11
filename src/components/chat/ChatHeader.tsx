"use client";

import { useAppSelector } from "@/store/hooks";
import {
  selectActiveConversation,
  selectConnectionStatus,
  selectActiveTypingUsers,
} from "@/store/selectors/chatSelectors";
import { Circle, Info, Phone, Video } from "lucide-react";
import Image from "next/image";
import React from "react";

export function ChatHeader() {
  const conversation = useAppSelector(selectActiveConversation);
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const typingUsers = useAppSelector(selectActiveTypingUsers);

  if (!conversation) return null;

  return (
    <header className="h-16 px-6 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10">
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700/60">
            {conversation.avatarUrl ? (
              <Image
                src={conversation.avatarUrl}
                alt={conversation.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                {conversation.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            {conversation.name}
          </h2>

          <div className="flex items-center gap-2 text-xs">
            {typingUsers.length > 0 ? (
              <span className="text-indigo-400 animate-pulse font-medium">
                {typingUsers.map((u) => u.userName).join(", ")} is typing...
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Circle
                  className={`w-2 h-2 fill-current ${
                    connectionStatus === "connected"
                      ? "text-emerald-400"
                      : connectionStatus === "connecting"
                      ? "text-amber-400 animate-ping"
                      : "text-slate-500"
                  }`}
                />
                <span className="capitalize">{connectionStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-2 text-slate-400">
        <button
          title="Voice call"
          className="p-2 hover:bg-slate-800 rounded-lg hover:text-slate-200 transition-colors"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          title="Video call"
          className="p-2 hover:bg-slate-800 rounded-lg hover:text-slate-200 transition-colors"
        >
          <Video className="w-4 h-4" />
        </button>
        <button
          title="Conversation details"
          className="p-2 hover:bg-slate-800 rounded-lg hover:text-slate-200 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
