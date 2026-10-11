import { Conversation, User } from "@/types/chat";
import { CONTACT_USERS } from "@/mock/initialData";

export interface ConversationDisplayMeta {
  name: string;
  avatarUrl?: string;
  isGroup: boolean;
  status?: string;
  subtitle?: string;
}

export function getConversationDisplayMeta(
  conv: Conversation,
  currentUser: User | null
): ConversationDisplayMeta {
  if (conv.type === "group") {
    return {
      name: conv.name,
      avatarUrl: conv.avatarUrl,
      isGroup: true,
      subtitle: `${conv.participantIds?.length || 4} members`,
    };
  }

  // Direct 1-on-1: find the other participant
  if (currentUser) {
    // 1. Search participants list
    const otherParticipant = conv.participants?.find((p) => p.id !== currentUser.id);
    if (otherParticipant) {
      return {
        name: otherParticipant.name,
        avatarUrl: otherParticipant.avatarUrl,
        isGroup: false,
        status: otherParticipant.status,
      };
    }

    // 2. Search participantIds
    const otherId = conv.participantIds?.find((id) => id !== currentUser.id);
    if (otherId) {
      const foundUser = CONTACT_USERS.find((u) => u.id === otherId);
      if (foundUser) {
        return {
          name: foundUser.name,
          avatarUrl: foundUser.avatarUrl,
          isGroup: false,
          status: foundUser.status,
        };
      }
    }

    // 3. Fallback: If conv.name happens to be the current user's name, swap with partner
    if (conv.name.toLowerCase() === currentUser.name.toLowerCase()) {
      const fallback = CONTACT_USERS.find((u) => u.id !== currentUser.id) || CONTACT_USERS[0];
      return {
        name: fallback.name,
        avatarUrl: fallback.avatarUrl,
        isGroup: false,
        status: fallback.status,
      };
    }
  }

  return {
    name: conv.name,
    avatarUrl: conv.avatarUrl,
    isGroup: false,
    status: "online",
  };
}
