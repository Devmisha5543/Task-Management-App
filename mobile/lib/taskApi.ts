import { mobileApiRequest } from "./api";
import type { CreateTaskData, Task, TaskAttachment, TaskComment, TaskMember } from "../types/task";

export async function getTasks(): Promise<Task[]> {
  const data = await mobileApiRequest("/tasks");
  return data.tasks;
}

export async function createTask(taskData: CreateTaskData): Promise<Task> {
  const data = await mobileApiRequest("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
  return data.task;
}

export async function updateTask(
  id: string,
  taskData: CreateTaskData
): Promise<Task> {
  const data = await mobileApiRequest(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  await mobileApiRequest(`/tasks/${id}`, {
    method: "DELETE",
  });
}

// Task Collaboration / Members API
export async function addTaskMember(
  taskId: string,
  email: string,
  role: "editor" | "viewer"
): Promise<Task> {
  const data = await mobileApiRequest(`/tasks/${taskId}/members`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
  return data.task;
}

export async function getTaskMembers(taskId: string): Promise<TaskMember[]> {
  const data = await mobileApiRequest(`/tasks/${taskId}/members`);
  return data.members;
}

export async function removeTaskMember(
  taskId: string,
  userId: string
): Promise<void> {
  await mobileApiRequest(`/tasks/${taskId}/members/${userId}`, {
    method: "DELETE",
  });
}

// Task Attachments API
export async function getTaskAttachments(
  taskId: string
): Promise<TaskAttachment[]> {
  const data = await mobileApiRequest(`/tasks/${taskId}/attachments`);
  return data.attachments;
}

export async function uploadTaskAttachment(
  taskId: string,
  formData: FormData
): Promise<TaskAttachment> {
  const data = await mobileApiRequest(`/tasks/${taskId}/attachments`, {
    method: "POST",
    body: formData,
  });
  return data.attachment;
}

export async function deleteTaskAttachment(
  taskId: string,
  attachmentId: string
): Promise<void> {
  await mobileApiRequest(`/tasks/${taskId}/attachments/${attachmentId}`, {
    method: "DELETE",
  });
}

// Task Comments API
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const data = await mobileApiRequest(`/tasks/${taskId}/comments`);
  return data.comments;
}

export async function addComment(
  taskId: string,
  text: string
): Promise<TaskComment> {
  const data = await mobileApiRequest(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return data.comment;
}

export async function deleteComment(
  taskId: string,
  commentId: string
): Promise<void> {
  await mobileApiRequest(`/tasks/${taskId}/comments/${commentId}`, {
    method: "DELETE",
  });
}
