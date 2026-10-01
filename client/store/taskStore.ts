"use client";

import { create } from "zustand";

import {
  addTaskMember as addTaskMemberApi,
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  getTasks,
  removeTaskMember as removeTaskMemberApi,
  updateTask as updateTaskApi,
  addSubtask as addSubtaskApi,
  updateSubtask as updateSubtaskApi,
  deleteSubtask as deleteSubtaskApi,
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
  addSubtask: (taskId: string, title: string) => Promise<Task>;
  toggleSubtask: (
    taskId: string,
    subtaskId: string,
    completed: boolean
  ) => Promise<Task>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<Task>;
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
    const previousTasks = useTaskStore.getState().tasks;

    // Optimistic UI update
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task._id === id
          ? {
              ...task,
              ...taskData,
              status: taskData.status ?? task.status,
              priority: taskData.priority ?? task.priority,
            }
          : task
      ),
    }));

    try {
      const updatedTask = await updateTaskApi(id, taskData);

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === id ? updatedTask : task
        ),
      }));
    } catch (error) {
      // Rollback on error
      set({
        tasks: previousTasks,
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

  addSubtask: async (taskId, title) => {
    try {
      const updatedTask = await addSubtaskApi(taskId, title);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === taskId ? updatedTask : task
        ),
      }));
      return updatedTask;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to add subtask",
      });
      throw error;
    }
  },

  toggleSubtask: async (taskId, subtaskId, completed) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task._id !== taskId || !task.subtasks) return task;
        return {
          ...task,
          subtasks: task.subtasks.map((sub) =>
            sub._id === subtaskId
              ? { ...sub, completed, completedAt: completed ? new Date().toISOString() : null }
              : sub
          ),
        };
      }),
    }));

    try {
      const updatedTask = await updateSubtaskApi(taskId, subtaskId, { completed });
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === taskId ? updatedTask : task
        ),
      }));
      return updatedTask;
    } catch (error) {
      // Re-fetch to roll back if failed
      try {
        const tasks = await getTasks();
        set({ tasks });
      } catch {}
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update subtask",
      });
      throw error;
    }
  },

  deleteSubtask: async (taskId, subtaskId) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task._id !== taskId || !task.subtasks) return task;
        return {
          ...task,
          subtasks: task.subtasks.filter((sub) => sub._id !== subtaskId),
        };
      }),
    }));

    try {
      const updatedTask = await deleteSubtaskApi(taskId, subtaskId);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === taskId ? updatedTask : task
        ),
      }));
      return updatedTask;
    } catch (error) {
      try {
        const tasks = await getTasks();
        set({ tasks });
      } catch {}
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete subtask",
      });
      throw error;
    }
  },
}));