import { apiRequest } from "@/lib/api";

export interface ActivityLog {
  _id: string;
  task: string;
  user: {
    _id: string;
    name?: string;
    username?: string;
    email: string;
    avatar?: string;
  };
  action:
    | "created"
    | "updated_status"
    | "updated_details"
    | "added_member"
    | "removed_member"
    | "added_attachment"
    | "deleted_attachment"
    | "added_comment"
    | "deleted_comment"
    | "added_subtask"
    | "completed_subtask"
    | "uncompleted_subtask"
    | "deleted_subtask";
  details?: Record<string, unknown>;
  createdAt: string;
}

export const getTaskActivities = async (taskId: string): Promise<ActivityLog[]> => {
  const data = await apiRequest(`/tasks/${taskId}/activity`);
  return data;
};
