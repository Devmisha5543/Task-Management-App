"use client";

import { create } from "zustand";

import {
  addTaskMember as addTaskMemberApi,
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  getTasks,
  removeTaskMember as removeTaskMemberApi,
  updateTask as updateTaskApi,
} from "@/lib/taskApi";

import type { CreateTaskData, Task } from "@/types/task";

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  fetchTasks: () => Promise<void>;
  createTask: (taskData: CreateTaskData) => Promise<void>;
  updateTask: (
    id: string,
    taskData: CreateTaskData
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addMember: (
    taskId: string,
    email: string,
    role: "editor" | "viewer"
  ) => Promise<void>;
  removeMember: (taskId: string, userId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({
      loading: true,
      error: null,
    });

    try {
      const tasks = await getTasks();

      set({
        tasks,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch tasks",
      });
    }
  },

  createTask: async (taskData) => {
    try {
      const task = await createTaskApi(taskData);

      set((state) => ({
        tasks: [task, ...state.tasks],
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create task",
      });

      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const updatedTask = await updateTaskApi(id, taskData);

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === id ? updatedTask : task
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update task",
      });

      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await deleteTaskApi(id);

      set((state) => ({
        tasks: state.tasks.filter(
          (task) => task._id !== id
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete task",
      });

      throw error;
    }
  },

  addMember: async (taskId, email, role) => {
    try {
      const updatedTask = await addTaskMemberApi(taskId, email, role);

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === taskId ? updatedTask : task
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to add member to task",
      });

      throw error;
    }
  },

  removeMember: async (taskId, userId) => {
    try {
      await removeTaskMemberApi(taskId, userId);

      // Re-fetch or update task locally
      set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task._id !== taskId) return task;
          return {
            ...task,
            members: task.members.filter(
              (m) =>
                (typeof m.user === "string" ? m.user : (m.user as { _id: string })._id) !== userId
            ),
          };
        }),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove member from task",
      });

      throw error;
    }
  },
}));