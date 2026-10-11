import { ChatContainer } from "@/components/chat/ChatContainer";
import { Suspense } from "react";

export function generateStaticParams() {
  return [
    { conversationId: "conv-1" },
    { conversationId: "conv-2" },
    { conversationId: "conv-3" },
  ];
}

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex-1 h-screen flex items-center justify-center bg-[#070b13] text-slate-500 text-sm">
          Loading conversation...
        </div>
      }
    >
      <ChatContainer conversationId={conversationId} />
    </Suspense>
  );
}
