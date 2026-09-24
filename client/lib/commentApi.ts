import { apiRequest } from "@/lib/api";
import type { TaskComment } from "@/types/task";

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const data = await apiRequest(`/tasks/${taskId}/comments`);
  return data.comments;
}

export async function addComment(
  taskId: string,
  text: string
): Promise<TaskComment> {
  const data = await apiRequest(`/tasks/${taskId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  return data.comment;
}

export async function deleteComment(
  taskId: string,
  commentId: string
): Promise<void> {
  await apiRequest(`/tasks/${taskId}/comments/${commentId}`, {
    method: "DELETE",
  });
}
