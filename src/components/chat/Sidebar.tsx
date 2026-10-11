"use client";

import { signOutFromFirebase } from "@/lib/firebase";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveConversationId,
  selectConversationEntities,
} from "@/store/selectors/chatSelectors";
import { logout } from "@/store/slices/authSlice";
import {
  setActiveConversationId,
  upsertConversation,
} from "@/store/slices/conversationsSlice";
import { formatConversationTime } from "@/utils/dateFormatters";
import { LogOut, MessageSquare, Search, ShieldCheck, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface SidebarProps {
  onForwardDrop?: (targetConversationId: string) => void;
}

export function Sidebar({ onForwardDrop }: SidebarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const registeredUsers = useAppSelector((state) => state.users.users);
  const conversationsMap = useAppSelector(selectConversationEntities);
  const activeId = useAppSelector(selectActiveConversationId);

  const [searchQuery, setSearchQuery] = useState("");
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Show only OTHER real registered persons
  const otherUsers = registeredUsers.filter(
    (u) => u.id !== currentUser?.id
  );

  const filteredUsers = otherUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (partner: typeof otherUsers[0]) => {
    if (!currentUser) return;
    const convId = [currentUser.id, partner.id].sort().join("--");

    // Upsert conversation entity in store
    dispatch(
      upsertConversation({
        id: convId,
        type: "direct",
        name: partner.name,
        avatarUrl: partner.avatarUrl,
        participantIds: [currentUser.id, partner.id],
        participants: [currentUser, partner],
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      })
    );

    dispatch(setActiveConversationId(convId));
  };

  const handleLogout = async () => {
    document.cookie = "simuphish_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await signOutFromFirebase();
    dispatch(logout());
    router.push("/login");
  };

  return (
    <aside className="w-80 md:w-96 h-screen flex flex-col bg-[#0b1120] border-r border-slate-800/80 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
              SimuPhish
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                LIVE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Real-Time Messaging</p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search registered people..."
            aria-label="Search people"
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Real Contact List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-2 py-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>People ({filteredUsers.length})</span>
          <span className="text-[10px] font-mono text-emerald-400">
            {otherUsers.filter((u) => u.status === "online").length} online
          </span>
        </div>

        {filteredUsers.map((partner) => {
          if (!currentUser) return null;
          const convId = [currentUser.id, partner.id].sort().join("--");
          const conv = conversationsMap[convId];
          const isActive = convId === activeId;
          const isDropTarget = dragOverId === convId;

          return (
            <Link
              key={partner.id}
              href={`/${convId}`}
              onClick={() => handleSelectUser(partner)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverId(convId);
              }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverId(null);
                const msgId = e.dataTransfer.getData("text/plain");
                if (msgId && onForwardDrop) onForwardDrop(convId);
              }}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 relative group ${
                isActive
                  ? "bg-slate-800/90 text-white shadow-sm border border-slate-700/60"
                  : "text-slate-300 hover:bg-slate-800/40 border border-transparent"
              } ${isDropTarget ? "drop-target-active scale-[1.02]" : ""}`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-800 border border-slate-700/50">
                  {partner.avatarUrl ? (
                    <Image
                      src={partner.avatarUrl}
                      alt={partner.name}
                      width={44}
                      height={44}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                      {partner.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    partner.status === "online" ? "bg-emerald-500" : "bg-slate-500"
                  }`}
                />
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h2 className="text-sm font-medium truncate text-slate-100">
                    {partner.name}
                  </h2>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {conv?.lastMessage
                      ? formatConversationTime(conv.lastMessage.createdAt)
                      : ""}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 truncate">
                    {conv?.lastMessage
                      ? `${conv.lastMessage.senderName}: ${conv.lastMessage.content}`
                      : partner.email}
                  </p>

                  {conv && conv.unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500 text-white min-w-4 text-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs space-y-2">
            <UserPlus className="w-8 h-8 mx-auto mb-1 opacity-40 text-indigo-400" />
            <p className="font-semibold text-slate-300">No other users online yet</p>
            <p className="text-slate-400 max-w-xs mx-auto text-[11px]">
              Open another window or have a colleague sign in with Google or Email to start chatting!
            </p>
          </div>
        )}
      </div>

      {/* Logged-In User Profile & Sign Out Footer */}
      {currentUser && (
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                {currentUser.avatarUrl ? (
                  <Image
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-slate-100 truncate">
                {currentUser.name}
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser.email || "Active User"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
