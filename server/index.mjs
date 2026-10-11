import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

// Real state
const usersFile = path.resolve(__dirname, "../src/data/users.json");
function loadPersistedUsers() {
  try {
    if (fs.existsSync(usersFile)) {
      return new Map(JSON.parse(fs.readFileSync(usersFile, "utf8")).map((u) => [u.id, u]));
    }
  } catch {}
  return new Map();
}

function persistUsers(usersMap) {
  try {
    const list = Array.from(usersMap.values());
    const dir = path.dirname(usersFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(usersFile, JSON.stringify(list, null, 2), "utf8");
  } catch {}
}

const registeredUsers = loadPersistedUsers();
const messages = new Map(); // conversationId -> Message[]
const processedTempIds = new Map(); // clientTempId -> Message
const userSockets = new Map(); // userId -> Set<socketId>
const typingMap = new Map(); // conversationId -> Map<userId, userName>

// Express REST Endpoints
app.get("/api/users", (req, res) => {
  res.json(Array.from(registeredUsers.values()));
});

app.post("/api/users", (req, res) => {
  const user = req.body;
  if (user && user.id) {
    registeredUsers.set(user.id, user);
    persistUsers(registeredUsers);
    io.emit("users:update", Array.from(registeredUsers.values()));
    return res.json({ success: true, user, users: Array.from(registeredUsers.values()) });
  }
  res.status(400).json({ error: "Invalid user data" });
});

// Handshake Authentication
io.use((socket, next) => {
  const { userId, user } = socket.handshake.auth;

  if (!userId) {
    return next(new Error("Authentication failed: Missing userId in handshake"));
  }

  const validUser = user || {
    id: userId,
    name: "User " + userId.slice(0, 6),
    email: "",
    avatarUrl: "",
    status: "online",
  };

  socket.data.user = validUser;
  registeredUsers.set(userId, { ...validUser, status: "online" });
  persistUsers(registeredUsers);

  console.log(`[Auth Verified] ${validUser.name} (${userId}) connected`);
  next();
});

function broadcastTypingUpdate(conversationId) {
  const map = typingMap.get(conversationId);
  const typingUsers = map
    ? Array.from(map.entries()).map(([userId, userName]) => ({ userId, userName }))
    : [];

  io.to(conversationId).emit("typing:update", {
    conversationId,
    typingUsers,
  });
}

io.on("connection", (socket) => {
  const user = socket.data.user;

  if (!userSockets.has(user.id)) {
    userSockets.set(user.id, new Set());
  }
  userSockets.get(user.id).add(socket.id);

  // Broadcast user directory update
  io.emit("users:update", Array.from(registeredUsers.values()));

  socket.on("users:get", (ack) => {
    if (typeof ack === "function") {
      ack(Array.from(registeredUsers.values()));
    }
  });

  socket.on("room:join", ({ conversationId }) => {
    if (conversationId) {
      socket.join(conversationId);
      console.log(`[Room Joined] User ${user.name} joined ${conversationId}`);
    }
  });

  socket.on("message:send", (payload, ack) => {
    try {
      const {
        clientTempId,
        conversationId,
        type,
        content,
        mediaUrl,
        fileName,
        fileSize,
        replyToId,
      } = payload;

      socket.join(conversationId);

      if (processedTempIds.has(clientTempId)) {
        const existing = processedTempIds.get(clientTempId);
        if (typeof ack === "function") {
          return ack({ success: true, clientTempId, serverMessageId: existing.id, message: existing });
        }
        return;
      }

      const sanitizedContent = content ? content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") : "";

      const serverMessage = {
        id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        clientTempId,
        conversationId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatarUrl,
        type: type || "text",
        content: sanitizedContent,
        mediaUrl: mediaUrl || undefined,
        fileName: fileName || undefined,
        fileSize: fileSize || undefined,
        createdAt: new Date().toISOString(),
        status: "delivered",
        replyToId: replyToId || null,
      };

      if (!messages.has(conversationId)) {
        messages.set(conversationId, []);
      }
      messages.get(conversationId).push(serverMessage);
      processedTempIds.set(clientTempId, serverMessage);

      // Emit to all users in this conversation
      io.to(conversationId).emit("message:new", serverMessage);

      if (typingMap.has(conversationId)) {
        typingMap.get(conversationId).delete(user.id);
        broadcastTypingUpdate(conversationId);
      }

      console.log(`[Message Dispatched] ${user.name} -> ${conversationId}: "${sanitizedContent.slice(0, 30)}"`);

      if (typeof ack === "function") {
        ack({
          success: true,
          clientTempId,
          serverMessageId: serverMessage.id,
          message: serverMessage,
        });
      }
    } catch (err) {
      console.error("[Message Send Error]:", err);
      if (typeof ack === "function") {
        ack({ success: false, clientTempId: payload?.clientTempId, error: "Internal server error" });
      }
    }
  });

  socket.on("message:forward", (payload, ack) => {
    try {
      const { clientTempId, targetConversationId, originalMessageId } = payload;
      socket.join(targetConversationId);

      let originalMsg = null;
      for (const convMsgs of messages.values()) {
        const found = convMsgs.find((m) => m.id === originalMessageId);
        if (found) {
          originalMsg = found;
          break;
        }
      }

      if (!originalMsg) {
        if (typeof ack === "function") return ack({ success: false, clientTempId, error: "Original message not found" });
        return;
      }

      const forwardedMsg = {
        id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        clientTempId,
        conversationId: targetConversationId,
        senderId: user.id,
        senderName: user.name,
        type: originalMsg.type,
        content: originalMsg.content,
        mediaUrl: originalMsg.mediaUrl,
        fileName: originalMsg.fileName,
        createdAt: new Date().toISOString(),
        status: "delivered",
        isForwarded: true,
        forwardedFromId: originalMessageId,
      };

      if (!messages.has(targetConversationId)) {
        messages.set(targetConversationId, []);
      }
      messages.get(targetConversationId).push(forwardedMsg);
      processedTempIds.set(clientTempId, forwardedMsg);

      io.to(targetConversationId).emit("message:new", forwardedMsg);

      if (typeof ack === "function") {
        ack({ success: true, clientTempId, serverMessageId: forwardedMsg.id, message: forwardedMsg });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({ success: false, clientTempId: payload?.clientTempId, error: "Forward failed" });
      }
    }
  });

  socket.on("message:sync", (payload, ack) => {
    try {
      const { conversationId, lastSyncedAt } = payload;
      socket.join(conversationId);
      const convMsgs = messages.get(conversationId) || [];

      let missedMessages = convMsgs;
      if (lastSyncedAt) {
        const lastSyncedTime = new Date(lastSyncedAt).getTime();
        missedMessages = convMsgs.filter(
          (m) => new Date(m.createdAt).getTime() > lastSyncedTime
        );
      }

      if (typeof ack === "function") {
        ack({
          conversationId,
          messages: missedMessages,
          syncedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({ conversationId: payload?.conversationId, messages: [], syncedAt: new Date().toISOString() });
      }
    }
  });

  socket.on("typing:start", ({ conversationId }) => {
    if (!typingMap.has(conversationId)) {
      typingMap.set(conversationId, new Map());
    }
    typingMap.get(conversationId).set(user.id, user.name);
    broadcastTypingUpdate(conversationId);
  });

  socket.on("typing:stop", ({ conversationId }) => {
    if (typingMap.has(conversationId)) {
      typingMap.get(conversationId).delete(user.id);
      broadcastTypingUpdate(conversationId);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket Disconnected] ${user.name}`);
    const set = userSockets.get(user.id);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) {
        userSockets.delete(user.id);
        const existing = registeredUsers.get(user.id);
        if (existing) {
          registeredUsers.set(user.id, { ...existing, status: "offline", lastSeen: new Date().toISOString() });
          persistUsers(registeredUsers);
          io.emit("users:update", Array.from(registeredUsers.values()));
        }
      }
    }
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`[Notice] Port ${PORT} is already in use by another running instance. Continuing with active server.`);
  } else {
    console.error("[Server Error]:", err);
  }
});

server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`  SimuPhish Real-Time WebSocket Server Running on :${PORT}`);
  console.log(`======================================================`);
});
