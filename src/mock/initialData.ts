import { Conversation, Message, User } from "@/types/chat";

export const CONTACT_USERS: User[] = [
  {
    id: "user-1",
    name: "Sonjit Saha",
    email: "sonjit@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    status: "online",
  },
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

export const CURRENT_USER: User = CONTACT_USERS[0];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    type: "direct",
    name: "Sarah Jenkins",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    participantIds: ["user-1", "user-2"],
    participants: [CONTACT_USERS[0], CONTACT_USERS[1]],
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "conv-2",
    type: "direct",
    name: "Alex Rivera",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    participantIds: ["user-1", "user-3"],
    participants: [CONTACT_USERS[0], CONTACT_USERS[2]],
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "conv-3",
    type: "group",
    name: "Frontend Core Team",
    avatarUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
    participantIds: ["user-1", "user-2", "user-3", "user-4"],
    participants: CONTACT_USERS,
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
  },
];

// Assessment: clean conversation state, no preset messages
export const INITIAL_MESSAGES: Record<string, Message[]> = {};
