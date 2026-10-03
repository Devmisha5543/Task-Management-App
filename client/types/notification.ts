export interface NotificationItem {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    username: string;
    email: string;
    profilePhoto?: string;
  };
  task?: {
    _id: string;
    title: string;
    status: string;
    priority: string;
  };
  type:
    | "deadline_approaching"
    | "deadline_overdue"
    | "task_shared"
    | "new_comment"
    | "recurrence_spawned"
    | "dependency_blocked"
    | "general";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}
