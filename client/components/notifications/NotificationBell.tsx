"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/lib/notificationApi";
import type { NotificationItem } from "@/types/notification";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.warn("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 45 seconds for active background deadline/comment alerts
    const interval = setInterval(fetchNotifs, 45000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const target = notifications.find((n) => n._id === id);
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (target && !target.read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const filteredNotifs =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const getTypeStyle = (type: NotificationItem["type"]) => {
    switch (type) {
      case "deadline_overdue":
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-700",
          icon: "alert-circle" as const,
        };
      case "deadline_approaching":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-700",
          icon: "clock" as const,
        };
      case "task_shared":
        return {
          bg: "bg-purple-50 border-purple-200 text-purple-700",
          icon: "users" as const,
        };
      case "new_comment":
        return {
          bg: "bg-teal-50 border-teal-200 text-teal-700",
          icon: "comment" as const,
        };
      case "recurrence_spawned":
        return {
          bg: "bg-blue-50 border-blue-200 text-blue-700",
          icon: "repeat" as const,
        };
      case "dependency_blocked":
        return {
          bg: "bg-orange-50 border-orange-200 text-orange-700",
          icon: "link" as const,
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200 text-gray-700",
          icon: "sparkles" as const,
        };
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifs();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-black transition shadow-2xs"
        aria-label="Notifications"
        title="In-App Notification Center"
      >
        <Icon name="bell" className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-gray-400 hover:text-red-600"
                  title="Clear all notifications"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 border-b border-gray-100 px-4 py-2 bg-white">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                filter === "all"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                filter === "unread"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-xs text-gray-400">
                Loading notifications...
              </div>
            ) : filteredNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-2">
                  <Icon name="bell" className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-gray-600">
                  {filter === "unread" ? "No unread alerts" : "No notifications yet"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Approaching deadlines and team mentions will appear here.
                </p>
              </div>
            ) : (
              filteredNotifs.map((notif) => {
                const style = getTypeStyle(notif.type);
                return (
                  <div
                    key={notif._id}
                    onClick={() => {
                      if (!notif.read) handleMarkAsRead(notif._id);
                    }}
                    className={`group flex items-start gap-3 p-3.5 transition cursor-pointer ${
                      notif.read
                        ? "bg-white hover:bg-gray-50/80 opacity-75"
                        : "bg-blue-50/30 hover:bg-blue-50/60"
                    }`}
                  >
                    {/* Category Icon Badge */}
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${style.bg}`}
                    >
                      <Icon name={style.icon} className="h-3.5 w-3.5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <h4
                          className={`text-xs font-semibold leading-tight line-clamp-1 ${
                            notif.read ? "text-gray-800" : "text-gray-950 font-bold"
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="shrink-0 text-[10px] text-gray-400">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif._id, e)}
                          className="rounded p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-100"
                          title="Mark as read"
                        >
                          <Icon name="check" className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(notif._id, e)}
                        className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100"
                        title="Delete"
                      >
                        <Icon name="close" className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2 text-center text-[10px] text-gray-400">
            Real-time deadline reminders & task collaboration events
          </div>
        </div>
      )}
    </div>
  );
}
