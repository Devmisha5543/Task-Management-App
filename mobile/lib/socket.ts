import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getEffectiveApiUrl } from "./api";

let socket: Socket | null = null;

export const getMobileSocketUrl = async (): Promise<string> => {
  const apiUrl = await getEffectiveApiUrl();
  return apiUrl.replace(/\/api\/?$/, "");
};

export const initMobileSocket = async (): Promise<Socket> => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = await AsyncStorage.getItem("token");
  const socketUrl = await getMobileSocketUrl();

  if (socket) {
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
  });

  socket.on("connect", () => {
    // Re-join user room upon connection
    AsyncStorage.getItem("token").then((curToken) => {
      if (curToken && socket) {
        socket.auth = { token: curToken };
      }
    });
  });

  socket.on("connect_error", (err) => {
    console.warn("Mobile socket connection warning:", err.message);
  });

  return socket;
};

export const getMobileSocket = (): Socket | null => {
  return socket;
};

export const disconnectMobileSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
