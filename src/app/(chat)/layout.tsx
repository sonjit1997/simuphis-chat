import { Sidebar } from "@/components/chat/Sidebar";
import { SocketProvider } from "@/components/providers/SocketProvider";
import React from "react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#090d16]">
        <Sidebar />
        <main className="flex-1 h-screen overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </SocketProvider>
  );
}
