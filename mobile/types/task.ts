export interface TaskMember {
  user:
    | string
    | {
        _id: string;
        username: string;
        email: string;
        profilePhoto?: string;
      };
  role: "owner" | "editor" | "viewer";
}

export interface TaskAttachment {
  _id: string;
  task: string;
  filename: string;
  url?: string;
  fileUrl?: string;
  fileType?: string;
  mimetype?: string;
  size?: number;
  fileSize?: number;
  uploadedBy?:
    | {
        _id: string;
        username: string;
        email: string;
      }
    | string;
  createdAt: string;
}

export interface TaskComment {
  _id: string;
  text: string;
  task: string;
  user: {
    _id: string;
    username: string;
    email: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string | null;
  labels: string[];
  createdBy:
    | string
    | {
        _id: string;
        username: string;
        email: string;
      };
  members: TaskMember[];
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  dueDate?: string | null;
  labels?: string[];
}

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
    | "deleted_comment";
  details?: Record<string, any>;
  createdAt: string;
}
