"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

export const initSocket = (): Socket => {
  if (typeof window === "undefined") {
    return null as unknown as Socket;
  }

  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem("token");
  const socketUrl = getSocketUrl();

  if (socket) {
    // Update auth token if socket instance already exists
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(socketUrl, {
    auth: {
      token: token || undefined,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true,
  });

  socket.on("connect", () => {
    // Re-join user channel if token exists
    const currentToken = localStorage.getItem("token");
    if (currentToken && socket) {
      socket.auth = { token: currentToken };
    }
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connection warning:", err.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  if (typeof window === "undefined") return null;
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
