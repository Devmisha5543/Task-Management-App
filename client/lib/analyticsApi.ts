import { apiRequest } from "@/lib/api";
import type { Task, TaskAnalytics } from "@/types/task";

export const getTaskAnalytics = async (): Promise<{ analytics: TaskAnalytics }> => {
  return (await apiRequest("/tasks/analytics")) as { analytics: TaskAnalytics };
};

// Export tasks to CSV format and trigger instant browser download
export const exportTasksToCSV = (tasks: Task[], filename = "taskflow-export.csv") => {
  const headers = [
    "Task ID",
    "Title",
    "Description",
    "Status",
    "Priority",
    "Due Date",
    "Is Recurring",
    "Recurrence",
    "Total Subtasks",
    "Completed Subtasks",
    "Labels",
    "Created At",
  ];

  const rows = tasks.map((task) => {
    const totalSub = task.subtasks ? task.subtasks.length : 0;
    const compSub = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;
    const labelsStr = task.labels ? task.labels.join("; ") : "";
    const descStr = (task.description || "").replace(/"/g, '""');
    const titleStr = (task.title || "").replace(/"/g, '""');

    return [
      `"${task._id}"`,
      `"${titleStr}"`,
      `"${descStr}"`,
      `"${task.status}"`,
      `"${task.priority}"`,
      `"${task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}"`,
      `"${task.isRecurring ? "Yes" : "No"}"`,
      `"${task.recurrence || "none"}"`,
      totalSub,
      compSub,
      `"${labelsStr}"`,
      `"${new Date(task.createdAt).toISOString()}"`,
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export tasks to JSON backup format and trigger instant browser download
export const exportTasksToJSON = (tasks: Task[], filename = "taskflow-backup.json") => {
  const jsonContent = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: tasks.length,
      tasks,
    },
    null,
    2
  );
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
