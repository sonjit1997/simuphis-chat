import {
  ClientToServerEvents,
  ForwardMessagePayload,
  MessageAck,
  SendMessagePayload,
  ServerToClientEvents,
  SyncRequestPayload,
  SyncResponsePayload,
} from "@/types/socket";
import { User } from "@/types/chat";
import { io, Socket } from "socket.io-client";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: TypedSocket | null = null;
  private currentUserId: string | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.broadcastChannel = new BroadcastChannel("simuphish_tab_sync");
    }
  }

  public connect(user: User): TypedSocket {
    if (this.socket && this.currentUserId === user.id && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.currentUserId = user.id;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

    this.socket = io(socketUrl, {
      auth: {
        userId: user.id,
        user: user,
        token: `simuphish-session-${user.id}`,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    return this.socket;
  }

  public joinRoom(conversationId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("room:join", { conversationId });
    }
  }

  public getSocket(): TypedSocket | null {
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
    }
  }

  public sendMessage(payload: SendMessagePayload): Promise<MessageAck> {
    return new Promise((resolve) => {
      const serverMessage = {
        id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        clientTempId: payload.clientTempId,
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        senderName: payload.senderName,
        type: payload.type || "text",
        content: payload.content,
        mediaUrl: payload.mediaUrl,
        fileName: payload.fileName,
        fileSize: payload.fileSize,
        createdAt: new Date().toISOString(),
        status: "delivered" as const,
        replyToId: payload.replyToId || null,
      };

      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: "message:new",
          data: serverMessage,
        });
      }

      if (!this.socket || !this.socket.connected) {
        resolve({
          success: true,
          clientTempId: payload.clientTempId,
          serverMessageId: serverMessage.id,
          message: serverMessage,
        });
        return;
      }

      this.socket.emit("message:send", payload, (ack) => {
        resolve(ack);
      });
    });
  }

  public forwardMessage(payload: ForwardMessagePayload): Promise<MessageAck> {
    return new Promise((resolve) => {
      if (!this.socket || !this.socket.connected) {
        resolve({
          success: true,
          clientTempId: payload.clientTempId,
        });
        return;
      }

      this.socket.emit("message:forward", payload, (ack) => {
        resolve(ack);
      });
    });
  }

  public syncMessages(payload: SyncRequestPayload): Promise<SyncResponsePayload> {
    return new Promise((resolve) => {
      if (!this.socket || !this.socket.connected) {
        resolve({
          conversationId: payload.conversationId,
          messages: [],
          syncedAt: new Date().toISOString(),
        });
        return;
      }

      this.socket.emit("message:sync", payload, (response) => {
        resolve(response);
      });
    });
  }

  public startTyping(conversationId: string, userId: string, userName: string): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: "typing",
        data: { conversationId, userId, userName, isTyping: true },
      });
    }
    if (this.socket && this.socket.connected) {
      this.socket.emit("typing:start", { conversationId, userId, userName });
    }
  }

  public stopTyping(conversationId: string, userId: string): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: "typing",
        data: { conversationId, userId, isTyping: false },
      });
    }
    if (this.socket && this.socket.connected) {
      this.socket.emit("typing:stop", { conversationId, userId });
    }
  }
}

export const socketService = new SocketService();
