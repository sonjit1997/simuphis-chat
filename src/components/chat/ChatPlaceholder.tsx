import { MessageSquareText, ShieldAlert } from "lucide-react";
import React from "react";

export function ChatPlaceholder() {
  return (
    <div className="flex-1 h-screen flex flex-col items-center justify-center p-8 text-center bg-[#070b13]">
      <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 shadow-xl shadow-indigo-500/5">
        <MessageSquareText className="w-8 h-8" />
      </div>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">
        Select a Conversation
      </h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        Choose a direct chat or team channel from the sidebar to start real-time messaging.
      </p>
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
        <ShieldAlert className="w-4 h-4 text-indigo-400" />
        Supports Drag-and-Forward & Cloudinary uploads
      </div>
    </div>
  );
}
