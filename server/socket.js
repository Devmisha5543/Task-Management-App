const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

// Track active users and their connected socket IDs
const activeUsers = new Map(); // userId -> Set of socket IDs

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        // Allow anonymous connection or mark as unauthenticated
        socket.userId = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      return next();
    } catch (err) {
      console.warn("Socket authentication warning:", err.message);
      socket.userId = null;
      return next();
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    if (userId) {
      // Join personal room for notifications & direct updates
      socket.join(`user:${userId}`);

      if (!activeUsers.has(userId)) {
        activeUsers.set(userId, new Set());
      }
      activeUsers.get(userId).add(socket.id);

      // Broadcast presence state
      io.emit("presence:update", {
        onlineUserIds: Array.from(activeUsers.keys()),
      });
    }

    // Client requests current online users
    socket.on("presence:get_online", () => {
      socket.emit("presence:update", {
        onlineUserIds: Array.from(activeUsers.keys()),
      });
    });

    // Join specific task room for real-time collaboration (comments, status, typing)
    socket.on("task:join", ({ taskId, username }) => {
      if (!taskId) return;
      const room = `task:${taskId}`;
      socket.join(room);
      socket.to(room).emit("collaborator:joined", {
        taskId,
        userId: socket.userId,
        username: username || "A collaborator",
      });
    });

    // Leave task room
    socket.on("task:leave", ({ taskId, username }) => {
      if (!taskId) return;
      const room = `task:${taskId}`;
      socket.leave(room);
      socket.to(room).emit("collaborator:left", {
        taskId,
        userId: socket.userId,
        username: username || "A collaborator",
      });
    });

    // Task discussion typing indicator
    socket.on("task:typing", ({ taskId, username, isTyping }) => {
      if (!taskId) return;
      socket.to(`task:${taskId}`).emit("task:typing", {
        taskId,
        userId: socket.userId,
        username,
        isTyping,
      });
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      if (userId && activeUsers.has(userId)) {
        const userSockets = activeUsers.get(userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeUsers.delete(userId);
          io.emit("presence:update", {
            onlineUserIds: Array.from(activeUsers.keys()),
          });
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn("Socket.io not yet initialized");
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const emitToTask = (taskId, event, data) => {
  if (io && taskId) {
    io.to(`task:${taskId}`).emit(event, data);
  }
};

const emitGlobal = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToTask,
  emitGlobal,
};
