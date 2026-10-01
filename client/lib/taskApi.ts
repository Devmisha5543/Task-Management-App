import { apiRequest } from "@/lib/api";
import type { CreateTaskData, Task, TaskMember } from "@/types/task";

export async function getTasks(): Promise<Task[]> {
  const data = await apiRequest("/tasks");
  return data.tasks;
}

export async function createTask(
  taskData: CreateTaskData
): Promise<Task> {
  const data = await apiRequest("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
  return data.task;
}

export async function updateTask(
  id: string,
  taskData: CreateTaskData
): Promise<Task> {
  const data = await apiRequest(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiRequest(`/tasks/${id}`, {
    method: "DELETE",
  });
}

// Task Collaboration / Members API
export async function addTaskMember(
  taskId: string,
  email: string,
  role: "editor" | "viewer"
): Promise<Task> {
  const data = await apiRequest(`/tasks/${taskId}/members`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
  return data.task;
}

export async function getTaskMembers(taskId: string): Promise<TaskMember[]> {
  const data = await apiRequest(`/tasks/${taskId}/members`);
  return data.members;
}

export async function removeTaskMember(
  taskId: string,
  userId: string
): Promise<void> {
  await apiRequest(`/tasks/${taskId}/members/${userId}`, {
    method: "DELETE",
  });
}

// Subtasks API
export async function addSubtask(
  taskId: string,
  title: string
): Promise<Task> {
  const data = await apiRequest(`/tasks/${taskId}/subtasks`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  return data.task;
}

export async function updateSubtask(
  taskId: string,
  subtaskId: string,
  subtaskData: { completed?: boolean; title?: string }
): Promise<Task> {
  const data = await apiRequest(`/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: "PATCH",
    body: JSON.stringify(subtaskData),
  });
  return data.task;
}

export async function deleteSubtask(
  taskId: string,
  subtaskId: string
): Promise<Task> {
  const data = await apiRequest(`/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: "DELETE",
  });
  return data.task;
}