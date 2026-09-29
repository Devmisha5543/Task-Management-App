export interface TaskMember {
  user: string;
  role: "owner" | "editor" | "viewer";
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
  createdBy: string;
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