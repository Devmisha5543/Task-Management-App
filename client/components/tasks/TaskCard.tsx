"use client";

import { useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import type { Task, TaskDependency } from "@/types/task";

import Icon from "@/components/ui/Icon";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onShare?: (task: Task) => void;
  onAttachments?: (task: Task) => void;
  onComments?: (task: Task) => void;
  onActivity?: (task: Task) => void;
}

export default function TaskCard({
  task,
  onEdit,
  onShare,
  onAttachments,
  onComments,
  onActivity,
}: TaskCardProps) {
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const toggleSubtask = useTaskStore((state) => state.toggleSubtask);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: "todo" | "in-progress" | "done") => {
    try {
      setActionError(null);
      await updateTask(task._id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        labels: task.labels,
      });
    } catch (err: unknown) {
      console.error("Failed to update status:", err);
      setActionError(err instanceof Error ? err.message : "Failed to update status");
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task._id);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
      case "in-progress":
        return "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
      default:
        return "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60";
      case "medium":
        return "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60";
      default:
        return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
    }
  };

  const getDueDateInfo = (dueDateStr?: string | null, status?: string) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((dueMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24));

    const isDone = status === "done";
    const dateFormatted = due.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    if (isDone) {
      return {
        text: `Due ${dateFormatted}`,
        badgeClass: "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700",
      };
    }

    if (diffDays < 0) {
      const daysOverdue = Math.abs(diffDays);
      return {
        text: `${daysOverdue}d overdue (${dateFormatted})`,
        badgeClass: "bg-red-100 dark:bg-rose-950/50 text-red-700 dark:text-rose-300 border-red-200 dark:border-rose-800/60 font-semibold",
      };
    }
    if (diffDays === 0) {
      return {
        text: "Due Today",
        badgeClass: "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-semibold",
      };
    }
    if (diffDays === 1) {
      return {
        text: "Due Tomorrow",
        badgeClass: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 font-medium",
      };
    }
    if (diffDays <= 3) {
      return {
        text: `Due in ${diffDays} days (${dateFormatted})`,
        badgeClass: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 font-medium",
      };
    }
    return {
      text: `Due ${dateFormatted}`,
      badgeClass: "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700",
    };
  };

  const memberCount = task.members ? task.members.length : 1;
  const dueDateInfo = getDueDateInfo(task.dueDate, task.status);

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm transition hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-md">
      <div>
        {/* Header Badges & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
                task.status
              )}`}
            >
              {task.status === "in-progress"
                ? "In Progress"
                : task.status === "done"
                ? "Done"
                : "To Do"}
            </span>

            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getPriorityBadge(
                task.priority
              )}`}
            >
              {task.priority} Priority
            </span>

            {dueDateInfo && (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${dueDateInfo.badgeClass}`}
              >
                <Icon name="calendar" className="w-3 h-3" />
                {dueDateInfo.text}
              </span>
            )}

            {task.isRecurring && task.recurrence && task.recurrence !== "none" && (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 capitalize"
                title={`Recurring (${task.recurrence}): Next cycle will auto-spawn upon completion.`}
              >
                <Icon name="repeat" className="w-3 h-3" />
                {task.recurrence}
              </span>
            )}

            {task.dependencies && task.dependencies.length > 0 && (() => {
              const deps = task.dependencies as (TaskDependency | string)[];
              const incompleteDeps = deps.filter(
                (d) => typeof d === "object" && d !== null && d.status !== "done"
              ) as TaskDependency[];
              const isBlocked = incompleteDeps.length > 0;

              if (task.status === "done") return null;

              return isBlocked ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300"
                  title={`Blocked by ${incompleteDeps.length} task(s): ${incompleteDeps.map((d) => d.title).join(", ")}`}
                >
                  <Icon name="link" className="w-3 h-3" />
                  Blocked ({incompleteDeps.length})
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                  title="All prerequisite dependencies are completed"
                >
                  <Icon name="link" className="w-3 h-3" />
                  Prerequisites clear
                </span>
              );
            })()}
          </div>

          <div className="flex items-center gap-1">
            {onComments && (
              <button
                onClick={() => onComments(task)}
                className="relative rounded p-1.5 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition"
                title="Task Discussion / Comments"
              >
                <Icon name="comment" className="w-4 h-4" />
                {task.commentsCount ? task.commentsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {task.commentsCount}
                  </span>
                ) : null}
              </button>
            )}

            {onAttachments && (
              <button
                onClick={() => onAttachments(task)}
                className="rounded p-1.5 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition"
                title="Attachments"
              >
                <Icon name="attachment" className="w-4 h-4" />
              </button>
            )}

            {onShare && (
              <button
                onClick={() => onShare(task)}
                className="rounded p-1.5 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition"
                title="Share Task / Manage Members"
              >
                <Icon name="share" className="w-4 h-4" />
              </button>
            )}

            {onActivity && (
              <button
                onClick={() => onActivity(task)}
                className="rounded p-1.5 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition"
                title="Activity Log / History"
              >
                <Icon name="history" className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onEdit(task)}
              className="rounded p-1.5 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition"
              title="Edit Task"
            >
              <Icon name="edit" className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowConfirmDelete(true)}
              className="rounded p-1.5 text-gray-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-rose-950/40 hover:text-red-600 dark:hover:text-rose-400 transition"
              title="Delete Task"
            >
              <Icon name="trash" className="w-4 h-4 text-red-500 dark:text-rose-400" />
            </button>
          </div>
        </div>

        {/* Action / Blocker Error Banner */}
        {actionError && (
          <div className="mt-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-2 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
            <Icon name="alert-circle" className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Task Title */}
        <h3 className="mt-3 font-semibold text-gray-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition">
          {task.title}
        </h3>

        {/* Task Description */}
        {task.description && (
          <p className="mt-1 line-clamp-3 text-sm text-gray-600 dark:text-zinc-400">
            {task.description}
          </p>
        )}

        {/* Labels & Member Indicator */}
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          {task.labels && task.labels.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map((label, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-zinc-300"
                >
                  #{label}
                </span>
              ))}
            </div>
          ) : (
            <div></div>
          )}

          {memberCount > 1 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/50">
              <Icon name="users" className="w-3 h-3" />
              {memberCount} members
            </span>
          )}
        </div>

        {/* Subtasks / Checklist Section */}
        {totalSubtasks > 0 && (
          <div className="mt-3.5 rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/40 p-2.5">
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition"
              >
                <Icon
                  name="check"
                  className={`w-3.5 h-3.5 ${
                    completedSubtasks === totalSubtasks
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                />
                <span>
                  Checklist ({completedSubtasks}/{totalSubtasks})
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                  {showSubtasks ? "▲" : "▼"}
                </span>
              </button>
              <span
                className={`text-xs font-semibold ${
                  completedSubtasks === totalSubtasks
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-600 dark:text-zinc-400"
                }`}
              >
                {subtaskProgress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  subtaskProgress === 100 ? "bg-emerald-500" : "bg-blue-600"
                }`}
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>

            {/* Expandable subtasks quick-checklist */}
            {showSubtasks && (
              <div className="mt-2.5 space-y-1.5 border-t border-gray-200/60 dark:border-zinc-700/60 pt-2">
                {task.subtasks?.map((subtask) => (
                  <label
                    key={subtask._id || subtask.title}
                    className="flex items-center gap-2 text-xs cursor-pointer group/sub"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={(e) => {
                        if (subtask._id) {
                          toggleSubtask(task._id, subtask._id, e.target.checked);
                        }
                      }}
                      className="rounded border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                    />
                    <span
                      className={`truncate transition ${
                        subtask.completed
                          ? "line-through text-gray-400 dark:text-zinc-500"
                          : "text-gray-700 dark:text-zinc-300 group-hover/sub:text-black dark:group-hover/sub:text-white"
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Quick Status Switcher */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800/80 pt-3 text-xs text-gray-500 dark:text-zinc-400">
        <span>Status:</span>
        <select
          value={task.status}
          onChange={(e) =>
            handleStatusChange(
              e.target.value as "todo" | "in-progress" | "done"
            )
          }
          className="rounded border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-gray-700 dark:text-zinc-200 focus:border-black dark:focus:border-zinc-500 focus:outline-none transition"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Confirmation Modal for Delete */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 shadow-lg">
            <h4 className="font-semibold text-gray-900 dark:text-zinc-100">Delete Task?</h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="rounded-lg border border-gray-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
