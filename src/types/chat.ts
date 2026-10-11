export type MessageType = "text" | "image" | "video";

export type MessageStatus = "sending" | "sent" | "delivered" | "failed";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: "online" | "offline";
  lastSeen?: string;
}

export interface RepliedMessageInfo {
  id: string;
  senderName: string;
  content: string;
  type: MessageType;
}

export interface Message {
  id: string;
  clientTempId?: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string; // ISO 8601
  status: MessageStatus;
  replyToId?: string | null;
  repliedToMessage?: RepliedMessageInfo | null;
  forwardedFromId?: string | null;
  isForwarded?: boolean;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string;
  avatarUrl: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: {
    id: string;
    content: string;
    type: MessageType;
    senderName: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface GroupedMessage extends Message {
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
}
