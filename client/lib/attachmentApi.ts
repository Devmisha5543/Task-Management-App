import { apiRequest } from "@/lib/api";
import type { TaskAttachment } from "@/types/attachment";

export async function uploadAttachment(
  taskId: string,
  file: File
): Promise<TaskAttachment> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiRequest(`/tasks/${taskId}/attachments`, {
    method: "POST",
    body: formData,
  });

  return data.attachment;
}

export async function getTaskAttachments(
  taskId: string
): Promise<TaskAttachment[]> {
  const data = await apiRequest(`/tasks/${taskId}/attachments`);
  return data.attachments;
}

export async function deleteTaskAttachment(
  taskId: string,
  attachmentId: string
): Promise<void> {
  await apiRequest(`/tasks/${taskId}/attachments/${attachmentId}`, {
    method: "DELETE",
  });
}
