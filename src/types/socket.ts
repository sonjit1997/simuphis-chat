import { Message, MessageType } from "./chat";

export interface SendMessagePayload {
  clientTempId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  replyToId?: string | null;
}

export interface ForwardMessagePayload {
  clientTempId: string;
  targetConversationId: string;
  originalMessageId: string;
  senderId: string;
  senderName: string;
}

export interface MessageAck {
  success: boolean;
  clientTempId: string;
  serverMessageId?: string;
  message?: Message;
  error?: string;
}

export interface SyncRequestPayload {
  conversationId: string;
  lastSyncedAt?: string;
}

export interface SyncResponsePayload {
  conversationId: string;
  messages: Message[];
  syncedAt: string;
}

export interface TypingUpdatePayload {
  conversationId: string;
  typingUsers: Array<{ userId: string; userName: string }>;
}

export interface UserStatusPayload {
  userId: string;
  status: "online" | "offline";
}

export interface ClientToServerEvents {
  "user:register": (userId: string) => void;
  "message:send": (
    payload: SendMessagePayload,
    callback: (ack: MessageAck) => void
  ) => void;
  "message:forward": (
    payload: ForwardMessagePayload,
    callback: (ack: MessageAck) => void
  ) => void;
  "message:sync": (
    payload: SyncRequestPayload,
    callback: (response: SyncResponsePayload) => void
  ) => void;
  "typing:start": (payload: {
    conversationId: string;
    userId: string;
    userName: string;
  }) => void;
  "typing:stop": (payload: { conversationId: string; userId: string }) => void;
}

export interface ServerToClientEvents {
  "message:new": (message: Message) => void;
  "message:ack": (ack: MessageAck) => void;
  "typing:update": (payload: TypingUpdatePayload) => void;
  "user:status": (payload: UserStatusPayload) => void;
}
