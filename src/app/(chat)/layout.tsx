import { Sidebar } from "@/components/chat/Sidebar";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from "@/mock/initialData";
import { StoreProvider } from "@/store/StoreProvider";
import React from "react";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = INITIAL_CONVERSATIONS;
  const initialMessages = Object.values(INITIAL_MESSAGES).flat();

  return (
    <StoreProvider
      initialConversations={conversations}
      initialMessages={initialMessages}
    >
      <SocketProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-[#090d16]">
          <Sidebar />
          <main className="flex-1 h-screen overflow-hidden flex flex-col">
            {children}
          </main>
        </div>
      </SocketProvider>
    </StoreProvider>
  );
}
