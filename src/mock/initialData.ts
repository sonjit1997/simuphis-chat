import { Conversation, Message, User } from "@/types/chat";

export const CURRENT_USER: User = {
  id: "user-1",
  name: "Sonjit Saha",
  email: "sonjit@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
  status: "online",
};

export const CONTACT_USERS: User[] = [
  {
    id: "user-2",
    name: "Sarah Jenkins",
    email: "sarah@simuphish.com",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    status: "online",
  },
  {
    id: "user-3",
    name: "Alex Rivera",
    email: "alex@simuphish.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    status: "online",
  },
  {
    id: "user-4",
    name: "Elena Rostova",
    email: "elena@simuphish.com",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces",
    status: "offline",
    lastSeen: "2 hours ago",
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    type: "direct",
    name: "Sarah Jenkins",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    participantIds: ["user-1", "user-2"],
    participants: [CURRENT_USER, CONTACT_USERS[0]],
    lastMessage: {
      id: "msg-3",
      content: "Let's review the SimuPhish dashboard preview tomorrow morning!",
      type: "text",
      senderName: "Sarah Jenkins",
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "conv-2",
    type: "direct",
    name: "Alex Rivera",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    participantIds: ["user-1", "user-3"],
    participants: [CURRENT_USER, CONTACT_USERS[1]],
    lastMessage: {
      id: "msg-10",
      content: "Can you send the Cloudinary upload architecture diagram?",
      type: "text",
      senderName: "Alex Rivera",
      createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
  },
  {
    id: "conv-3",
    type: "group",
    name: "Frontend Core Team",
    avatarUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
    participantIds: ["user-1", "user-2", "user-3", "user-4"],
    participants: [CURRENT_USER, ...CONTACT_USERS],
    lastMessage: {
      id: "msg-20",
      content: "Elena updated the accessibility drag-and-forward spec.",
      type: "text",
      senderName: "Alex Rivera",
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    unreadCount: 3,
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "user-2",
      senderName: "Sarah Jenkins",
      senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      type: "text",
      content: "Hey Sonjit! Did you check the requirements for the real-time chat assessment?",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      status: "delivered",
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      senderId: "user-1",
      senderName: "Sonjit Saha",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      type: "text",
      content: "Yes! Designing it with Next.js App Router, Redux Toolkit, and Socket.io with strict resilience.",
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      status: "delivered",
      replyToId: "msg-1",
      repliedToMessage: {
        id: "msg-1",
        senderName: "Sarah Jenkins",
        content: "Hey Sonjit! Did you check the requirements for the real-time chat assessment?",
        type: "text",
      },
    },
    {
      id: "msg-3",
      conversationId: "conv-1",
      senderId: "user-2",
      senderName: "Sarah Jenkins",
      senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      type: "text",
      content: "Let's review the SimuPhish dashboard preview tomorrow morning!",
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      status: "delivered",
    },
  ],
  "conv-2": [
    {
      id: "msg-10",
      conversationId: "conv-2",
      senderId: "user-3",
      senderName: "Alex Rivera",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      type: "text",
      content: "Can you send the Cloudinary upload architecture diagram?",
      createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      status: "delivered",
    },
  ],
  "conv-3": [
    {
      id: "msg-20",
      conversationId: "conv-3",
      senderId: "user-3",
      senderName: "Alex Rivera",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      type: "text",
      content: "Elena updated the accessibility drag-and-forward spec.",
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      status: "delivered",
    },
  ],
};
