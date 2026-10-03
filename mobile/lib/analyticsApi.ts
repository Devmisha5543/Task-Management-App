import { mobileApiRequest } from "./api";
import type { Task, TaskAnalytics } from "../types/task";
import { Share, Platform } from "react-native";

export const getTaskAnalytics = async (): Promise<{ analytics: TaskAnalytics }> => {
  return await mobileApiRequest("/tasks/analytics");
};

// Share or export tasks summary as formatted text / JSON
export const shareTasksData = async (tasks: Task[], format: "csv" | "json" = "json") => {
  try {
    let content = "";
    if (format === "csv") {
      const headers = "Task ID,Title,Status,Priority,Due Date,Recurrence";
      const rows = tasks.map((t) =>
        `"${t._id}","${t.title}","${t.status}","${t.priority}","${t.dueDate || ""}","${t.recurrence || "none"}"`
      );
      content = [headers, ...rows].join("\n");
    } else {
      content = JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          count: tasks.length,
          tasks,
        },
        null,
        2
      );
    }

    if (Platform.OS === "web") {
      // In web browser export directly as download
      const blob = new Blob([content], {
        type: format === "csv" ? "text/csv;charset=utf-8;" : "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `taskflow-export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      await Share.share({
        message: content,
        title: `TaskFlow Tasks Export (${format.toUpperCase()})`,
      });
    }
  } catch (error) {
    console.error("Failed to share tasks data:", error);
  }
};
