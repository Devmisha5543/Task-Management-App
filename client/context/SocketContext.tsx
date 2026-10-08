"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { getSocket, initSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useTaskStore } from "@/store/taskStore";
import type { Task } from "@/types/task";

interface TypingEventData {
  taskId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

interface CollaboratorPresenceData {
  taskId: string;
  userId: string;
  username: string;
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: string[];
  typingUsers: Record<string, string[]>; // taskId -> Array of usernames typing
  taskViewers: Record<string, string[]>; // taskId -> Array of usernames viewing
  joinTask: (taskId: string) => void;
  leaveTask: (taskId: string) => void;
  sendTyping: (taskId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  onlineUserIds: [],
  typingUsers: {},
  taskViewers: {},
  joinTask: () => {},
  leaveTask: () => {},
  sendTyping: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [taskViewers, setTaskViewers] = useState<Record<string, string[]>>({});

  const user = useAuthStore((state) => state.user);
  const username = user?.username;

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token && !user) {
      setIsConnected(false);
      return;
    }

    const socketInstance = initSocket();
    setSocket(socketInstance);

    if (!socketInstance) return;

    function handleConnect() {
      setIsConnected(true);
      socketInstance?.emit("presence:get_online");
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    function handlePresenceUpdate(data: { onlineUserIds: string[] }) {
      setOnlineUserIds(data.onlineUserIds || []);
    }

    function handleTaskCreated(data: { task: Task }) {
      if (data?.task) {
        useTaskStore.getState().onSocketTaskCreated(data.task);
      }
    }

    function handleTaskUpdated(data: { task: Task }) {
      if (data?.task) {
        useTaskStore.getState().onSocketTaskUpdated(data.task);
      }
    }

    function handleTaskDeleted(data: { taskId: string }) {
      if (data?.taskId) {
        useTaskStore.getState().onSocketTaskDeleted(data.taskId);
      }
    }

    function handleTaskTyping(data: TypingEventData) {
      if (!data?.taskId || !data?.username) return;
      setTypingUsers((prev) => {
        const currentList = prev[data.taskId] || [];
        if (data.isTyping) {
          if (!currentList.includes(data.username)) {
            return { ...prev, [data.taskId]: [...currentList, data.username] };
          }
          return prev;
        } else {
          return {
            ...prev,
            [data.taskId]: currentList.filter((u) => u !== data.username),
          };
        }
      });
    }

    function handleCollaboratorJoined(data: CollaboratorPresenceData) {
      if (!data?.taskId || !data?.username) return;
      setTaskViewers((prev) => {
        const list = prev[data.taskId] || [];
        if (!list.includes(data.username)) {
          return { ...prev, [data.taskId]: [...list, data.username] };
        }
        return prev;
      });
    }

    function handleCollaboratorLeft(data: CollaboratorPresenceData) {
      if (!data?.taskId || !data?.username) return;
      setTaskViewers((prev) => {
        const list = prev[data.taskId] || [];
        return {
          ...prev,
          [data.taskId]: list.filter((u) => u !== data.username),
        };
      });
    }

    if (socketInstance.connected) {
      setIsConnected(true);
    }

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("presence:update", handlePresenceUpdate);
    socketInstance.on("task:created", handleTaskCreated);
    socketInstance.on("task:updated", handleTaskUpdated);
    socketInstance.on("task:deleted", handleTaskDeleted);
    socketInstance.on("task:typing", handleTaskTyping);
    socketInstance.on("collaborator:joined", handleCollaboratorJoined);
    socketInstance.on("collaborator:left", handleCollaboratorLeft);

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("presence:update", handlePresenceUpdate);
      socketInstance.off("task:created", handleTaskCreated);
      socketInstance.off("task:updated", handleTaskUpdated);
      socketInstance.off("task:deleted", handleTaskDeleted);
      socketInstance.off("task:typing", handleTaskTyping);
      socketInstance.off("collaborator:joined", handleCollaboratorJoined);
      socketInstance.off("collaborator:left", handleCollaboratorLeft);
    };
  }, [user]);

  const joinTask = useCallback(
    (taskId: string) => {
      const activeSocket = socket || getSocket();
      if (activeSocket && taskId && username) {
        activeSocket.emit("task:join", { taskId, username });
      }
    },
    [socket, username]
  );

  const leaveTask = useCallback(
    (taskId: string) => {
      const activeSocket = socket || getSocket();
      if (activeSocket && taskId && username) {
        activeSocket.emit("task:leave", { taskId, username });
      }
    },
    [socket, username]
  );

  const sendTyping = useCallback(
    (taskId: string, isTyping: boolean) => {
      const activeSocket = socket || getSocket();
      if (activeSocket && taskId && username) {
        activeSocket.emit("task:typing", { taskId, username, isTyping });
      }
    },
    [socket, username]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUserIds,
        typingUsers,
        taskViewers,
        joinTask,
        leaveTask,
        sendTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
