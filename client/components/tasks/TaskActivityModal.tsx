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
        return { text: "Created", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "updated_status":
        return { text: "Status Changed", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "updated_details":
        return { text: "Task Updated", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "added_member":
        return { text: "Member Added", color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "removed_member":
        return { text: "Member Removed", color: "bg-rose-100 text-rose-800 border-rose-200" };
      case "added_attachment":
        return { text: "File Uploaded", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "added_comment":
        return { text: "Commented", color: "bg-teal-100 text-teal-800 border-teal-200" };
      default:
        return { text: action, color: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  const formatDetails = (activity: ActivityLog) => {
    const details = activity.details || {};
    if (activity.action === "updated_status" && details.oldStatus && details.newStatus) {
      return (
        <span className="text-xs text-gray-600">
          Moved from <strong className="capitalize">{String(details.oldStatus)}</strong> to{" "}
          <strong className="capitalize">{String(details.newStatus)}</strong>
        </span>
      );
    }
    if (activity.action === "added_member" && details.addedUserEmail) {
      return (
        <span className="text-xs text-gray-600">
          Added <strong>{String(details.addedUserEmail)}</strong> as {String(details.role || "member")}
        </span>
      );
    }
    if (activity.action === "added_attachment" && details.filename) {
      return (
        <span className="text-xs text-gray-600">
          Uploaded attachment: <strong>{String(details.filename)}</strong>
        </span>
      );
    }
    if (activity.action === "added_comment" && details.textSnippet) {
      return (
        <span className="text-xs text-gray-600 italic">
          &quot;{String(details.textSnippet)}...&quot;
        </span>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Task Activity Log</h3>
            <p className="text-xs text-gray-500 truncate max-w-xs">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content / Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              Loading activity history...
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No activity logs recorded yet for this task.
            </div>
          ) : (
            <div className="relative border-l border-gray-200 pl-4 space-y-6">
              {activities.map((act) => {
                const badge = getActionBadge(act.action);
                const userName = act.user?.name || act.user?.username || act.user?.email || "User";
                const timeAgo = new Date(act.createdAt).toLocaleString();

                return (
                  <div key={act._id} className="relative group">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-gray-400 group-hover:bg-blue-600 transition-colors" />

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-gray-900">{userName}</span>
                      <span className="text-[10px] text-gray-400">{timeAgo}</span>
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
        <div className="flex justify-end border-t px-6 py-3 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
