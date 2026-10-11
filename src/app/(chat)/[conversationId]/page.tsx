import { ChatContainer } from "@/components/chat/ChatContainer";
import { Suspense, use } from "react";

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

function ConversationContent({ params }: ConversationPageProps) {
  const { conversationId } = use(params);
  return <ChatContainer conversationId={conversationId} />;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 h-screen flex items-center justify-center bg-[#070b13] text-slate-500 text-sm">
          Loading conversation...
        </div>
      }
    >
      <ConversationContent params={params} />
    </Suspense>
  );
}
