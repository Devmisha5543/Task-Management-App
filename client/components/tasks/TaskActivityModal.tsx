"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/types/task";
import { getTaskActivities, type ActivityLog } from "@/lib/activityApi";
import Icon from "@/components/ui/Icon";

interface TaskActivityModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskActivityModal({
  task,
  isOpen,
  onClose,
}: TaskActivityModalProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !task) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getTaskActivities(task._id)
      .then((data) => {
        if (isMounted) {
          setActivities(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load activities:", err);
          setError("Failed to load task activity history");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const getActionBadge = (action: string) => {
    switch (action) {
      case "created":
        return { text: "Created", color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60" };
      case "updated_status":
        return { text: "Status Changed", color: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/60" };
      case "updated_details":
        return { text: "Task Updated", color: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60" };
      case "added_member":
        return { text: "Member Added", color: "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/60" };
      case "removed_member":
        return { text: "Member Removed", color: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60" };
      case "added_attachment":
        return { text: "File Uploaded", color: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60" };
      case "added_comment":
        return { text: "Commented", color: "bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800/60" };
      case "added_subtask":
        return { text: "Subtask Added", color: "bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/60" };
      case "completed_subtask":
        return { text: "Subtask Completed", color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60" };
      case "uncompleted_subtask":
        return { text: "Subtask Reopened", color: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/60" };
      case "deleted_subtask":
        return { text: "Subtask Removed", color: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60" };
      default:
        return { text: action, color: "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700" };
    }
  };

  const formatDetails = (activity: ActivityLog) => {
    const details = activity.details || {};
    if (activity.action === "updated_status" && details.oldStatus && details.newStatus) {
      return (
        <span className="text-xs text-gray-600 dark:text-zinc-400">
          Moved from <strong className="capitalize">{String(details.oldStatus)}</strong> to{" "}
          <strong className="capitalize">{String(details.newStatus)}</strong>
        </span>
      );
    }
    if (activity.action === "added_member" && details.addedUserEmail) {
      return (
        <span className="text-xs text-gray-600 dark:text-zinc-400">
          Added <strong>{String(details.addedUserEmail)}</strong> as {String(details.role || "member")}
        </span>
      );
    }
    if (activity.action === "added_attachment" && details.filename) {
      return (
        <span className="text-xs text-gray-600 dark:text-zinc-400">
          Uploaded attachment: <strong>{String(details.filename)}</strong>
        </span>
      );
    }
    if (activity.action === "added_comment" && details.textSnippet) {
      return (
        <span className="text-xs text-gray-600 dark:text-zinc-400 italic">
          &quot;{String(details.textSnippet)}...&quot;
        </span>
      );
    }
    if (activity.action === "added_subtask" && details.title) {
      return (
        <span className="text-xs text-gray-600 dark:text-zinc-400">
          Added subtask: <strong>&quot;{String(details.title)}&quot;</strong>
        </span>
      );
    }
    if (activity.action === "completed_subtask" && details.title) {
      return (
        <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
          Completed subtask: <strong>&quot;{String(details.title)}&quot;</strong>
        </span>
      );
    }
    if (activity.action === "uncompleted_subtask" && details.title) {
      return (
        <span className="text-xs text-gray-600 dark:text-zinc-400">
          Reopened subtask: <strong>&quot;{String(details.title)}&quot;</strong>
        </span>
      );
    }
    if (activity.action === "deleted_subtask" && details.title) {
      return (
        <span className="text-xs text-gray-600 dark:text-zinc-400">
          Removed subtask: <strong>&quot;{String(details.title)}&quot;</strong>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Task Activity Log</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate max-w-xs">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-200 transition"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content / Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 dark:border-rose-900/60 bg-red-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-red-600 dark:text-rose-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500 dark:text-zinc-400">
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black dark:border-white border-t-transparent" />
              Loading activity history...
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 dark:text-zinc-500">
              No activity logs recorded yet for this task.
            </div>
          ) : (
            <div className="relative border-l border-gray-200 dark:border-zinc-800 pl-4 space-y-6">
              {activities.map((act) => {
                const badge = getActionBadge(act.action);
                const userName = act.user?.name || act.user?.username || act.user?.email || "User";
                const timeAgo = new Date(act.createdAt).toLocaleString();

                return (
                  <div key={act._id} className="relative group">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-zinc-900 bg-gray-400 dark:bg-zinc-600 group-hover:bg-blue-600 transition-colors" />

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-gray-900 dark:text-zinc-100">{userName}</span>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500">{timeAgo}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}>
                        {badge.text}
                      </span>
                      {formatDetails(act)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-gray-100 dark:border-zinc-800 px-6 py-3 bg-gray-50 dark:bg-zinc-900 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
