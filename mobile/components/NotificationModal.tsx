import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import Icon from "./Icon";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from "../lib/notificationApi";
import type { NotificationItem } from "../types/notification";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
      if (onUnreadCountChange) onUnreadCountChange(res.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications on mobile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      const updated = notifications.map((n) =>
        n._id === id ? { ...n, read: true } : n
      );
      setNotifications(updated);
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      if (onUnreadCountChange) onUnreadCountChange(newCount);
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const target = notifications.find((n) => n._id === id);
      await deleteNotification(id);
      setNotifications(notifications.filter((n) => n._id !== id));
      if (target && !target.read) {
        const newCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newCount);
        if (onUnreadCountChange) onUnreadCountChange(newCount);
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
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const filtered =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const getTypeStyle = (type: NotificationItem["type"]) => {
    switch (type) {
      case "deadline_overdue":
        return { color: "#dc2626", bg: "#fef2f2", icon: "alert-circle-outline" as const };
      case "deadline_approaching":
        return { color: "#d97706", bg: "#fffbeb", icon: "time-outline" as const };
      case "task_shared":
        return { color: "#7c3aed", bg: "#f5f3ff", icon: "people-outline" as const };
      case "new_comment":
        return { color: "#0d9488", bg: "#f0fdfa", icon: "chatbubble-outline" as const };
      case "recurrence_spawned":
        return { color: "#2563eb", bg: "#eff6ff", icon: "repeat-outline" as const };
      case "dependency_blocked":
        return { color: "#ea580c", bg: "#fff7ed", icon: "link-outline" as const };
      default:
        return { color: "#4b5563", bg: "#f3f4f6", icon: "notifications-outline" as const };
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
    <Modal visible={isOpen} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount} unread</Text>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="close-outline" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <View style={styles.filterPills}>
            <TouchableOpacity
              onPress={() => setFilter("all")}
              style={[styles.pill, filter === "all" && styles.pillActive]}
            >
              <Text
                style={[
                  styles.pillText,
                  filter === "all" && styles.pillTextActive,
                ]}
              >
                All ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter("unread")}
              style={[styles.pill, filter === "unread" && styles.pillActive]}
            >
              <Text
                style={[
                  styles.pillText,
                  filter === "unread" && styles.pillTextActive,
                ]}
              >
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text style={styles.actionBtnText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={[styles.actionBtnText, { color: "#dc2626" }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notification List */}
        {loading && notifications.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#111827" />
            <Text style={styles.emptyText}>Loading notifications...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={styles.emptyIconWrap}>
              <Icon name="notifications-outline" size={28} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === "unread" ? "No unread alerts" : "No notifications yet"}
            </Text>
            <Text style={styles.emptyText}>
              Approaching deadlines, recurrence cycles, and team updates will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const style = getTypeStyle(item.type);
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!item.read) handleMarkAsRead(item._id);
                  }}
                  style={[
                    styles.notifItem,
                    item.read ? styles.notifRead : styles.notifUnread,
                  ]}
                >
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: style.bg, borderColor: style.color + "33" },
                    ]}
                  >
                    <Icon name={style.icon} size={16} color={style.color} />
                  </View>

                  <View style={styles.notifBody}>
                    <View style={styles.notifHeader}>
                      <Text
                        style={[
                          styles.notifTitle,
                          !item.read && styles.notifTitleUnread,
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.timeAgo}>
                        {formatTimeAgo(item.createdAt)}
                      </Text>
                    </View>

                    <Text style={styles.notifMessage} numberOfLines={2}>
                      {item.message}
                    </Text>
                  </View>

                  <View style={styles.notifActions}>
                    {!item.read && (
                      <TouchableOpacity
                        onPress={() => handleMarkAsRead(item._id)}
                        style={styles.iconBtn}
                      >
                        <Icon name="checkmark-outline" size={14} color="#2563eb" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleDelete(item._id)}
                      style={styles.iconBtn}
                    >
                      <Icon name="trash-outline" size={14} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  unreadBadge: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1d4ed8",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#f9fafb",
  },
  filterPills: {
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  pillActive: {
    backgroundColor: "#111827",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  pillTextActive: {
    color: "#ffffff",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
  },
  listContent: {
    paddingVertical: 4,
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  notifUnread: {
    backgroundColor: "#f0f7ff",
  },
  notifRead: {
    backgroundColor: "#ffffff",
    opacity: 0.85,
  },
  typeBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: 12,
    marginTop: 2,
  },
  notifBody: {
    flex: 1,
    marginRight: 8,
  },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
    marginRight: 4,
  },
  notifTitleUnread: {
    fontWeight: "700",
    color: "#111827",
  },
  timeAgo: {
    fontSize: 10,
    color: "#9ca3af",
  },
  notifMessage: {
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 16,
  },
  notifActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});
