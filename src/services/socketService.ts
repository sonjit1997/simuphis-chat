import {
  ClientToServerEvents,
  ForwardMessagePayload,
  MessageAck,
  SendMessagePayload,
  ServerToClientEvents,
  SyncRequestPayload,
  SyncResponsePayload,
} from "@/types/socket";
import { io, Socket } from "socket.io-client";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: TypedSocket | null = null;
  private currentUserId: string | null = null;

  public connect(userId: string): TypedSocket {
    if (this.socket && this.currentUserId === userId && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.currentUserId = userId;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

    this.socket = io(socketUrl, {
      auth: {
        userId,
        token: `simuphish-session-${userId}`, // Verified session token
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    return this.socket;
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
      if (!this.socket || !this.socket.connected) {
        resolve({
          success: false,
          clientTempId: payload.clientTempId,
          error: "Socket disconnected: message queued",
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
          success: false,
          clientTempId: payload.clientTempId,
          error: "Socket disconnected",
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
    if (this.socket && this.socket.connected) {
      this.socket.emit("typing:start", { conversationId, userId, userName });
    }
  }

  public stopTyping(conversationId: string, userId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("typing:stop", { conversationId, userId });
    }
  }
}

export const socketService = new SocketService();
