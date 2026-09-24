"use client";

import { useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import type { Task } from "@/types/task";

import Icon from "@/components/ui/Icon";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onShare?: (task: Task) => void;
  onAttachments?: (task: Task) => void;
  onComments?: (task: Task) => void;
}

export default function TaskCard({
  task,
  onEdit,
  onShare,
  onAttachments,
  onComments,
}: TaskCardProps) {
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleStatusChange = async (newStatus: "todo" | "in-progress" | "done") => {
    try {
      await updateTask(task._id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        labels: task.labels,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
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
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "in-progress":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  const memberCount = task.members ? task.members.length : 1;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md">
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
          </div>

          <div className="flex items-center gap-1">
            {onComments && (
              <button
                onClick={() => onComments(task)}
                className="relative rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
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
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                title="Attachments"
              >
                <Icon name="attachment" className="w-4 h-4" />
              </button>
            )}

            {onShare && (
              <button
                onClick={() => onShare(task)}
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                title="Share Task / Manage Members"
              >
                <Icon name="share" className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onEdit(task)}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              title="Edit Task"
            >
              <Icon name="edit" className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowConfirmDelete(true)}
              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Delete Task"
            >
              <Icon name="trash" className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Task Title */}
        <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-black">
          {task.title}
        </h3>

        {/* Task Description */}
        {task.description && (
          <p className="mt-1 line-clamp-3 text-sm text-gray-600">
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
                  className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                >
                  #{label}
                </span>
              ))}
            </div>
          ) : (
            <div></div>
          )}

          {memberCount > 1 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              <Icon name="users" className="w-3 h-3" />
              {memberCount} members
            </span>
          )}
        </div>
      </div>

      {/* Footer / Quick Status Switcher */}
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-gray-500">
        <span>Status:</span>
        <select
          value={task.status}
          onChange={(e) =>
            handleStatusChange(
              e.target.value as "todo" | "in-progress" | "done"
            )
          }
          className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 focus:border-black focus:outline-none"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Confirmation Modal for Delete */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
            <h4 className="font-semibold text-gray-900">Delete Task?</h4>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
