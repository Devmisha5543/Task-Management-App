import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import Icon from "./Icon";
import { getTaskActivities } from "../lib/taskApi";
import type { Task, ActivityLog } from "../types/task";

interface TaskActivityModalProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
}

export default function TaskActivityModal({
  task,
  visible,
  onClose,
}: TaskActivityModalProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task && visible) {
      loadActivities();
    }
  }, [task, visible]);

  const loadActivities = async () => {
    if (!task) return;
    setLoading(true);
    setError(null);
    try {
      const list = await getTaskActivities(task._id);
      setActivities(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load activity history"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadActivities();
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "created":
        return { label: "Created", bg: "#D1FAE5", text: "#065F46" };
      case "updated_status":
        return { label: "Status Changed", bg: "#DBEAFE", text: "#1E40AF" };
      case "updated_details":
        return { label: "Updated", bg: "#FEF3C7", text: "#92400E" };
      case "added_member":
        return { label: "Member Added", bg: "#EDE9FE", text: "#5B21B6" };
      case "removed_member":
        return { label: "Member Removed", bg: "#FEE2E2", text: "#991B1B" };
      case "added_attachment":
        return { label: "File Uploaded", bg: "#E0E7FF", text: "#3730A3" };
      case "deleted_attachment":
        return { label: "File Removed", bg: "#FEE2E2", text: "#991B1B" };
      case "added_comment":
        return { label: "Commented", bg: "#CCFBF1", text: "#115E59" };
      case "deleted_comment":
        return { label: "Comment Removed", bg: "#FEE2E2", text: "#991B1B" };
      default:
        return { label: action, bg: "#F3F4F6", text: "#374151" };
    }
  };

  const formatDetails = (activity: ActivityLog) => {
    const details = activity.details || {};
    if (
      activity.action === "updated_status" &&
      details.oldStatus &&
      details.newStatus
    ) {
      return (
        <Text style={styles.detailText}>
          Moved from{" "}
          <Text style={styles.detailBold}>{String(details.oldStatus)}</Text> to{" "}
          <Text style={styles.detailBold}>{String(details.newStatus)}</Text>
        </Text>
      );
    }
    if (activity.action === "added_member" && details.addedUserEmail) {
      return (
        <Text style={styles.detailText}>
          Added <Text style={styles.detailBold}>{String(details.addedUserEmail)}</Text>{" "}
          as {String(details.role || "member")}
        </Text>
      );
    }
    if (activity.action === "added_attachment" && details.filename) {
      return (
        <Text style={styles.detailText}>
          Uploaded <Text style={styles.detailBold}>{String(details.filename)}</Text>
        </Text>
      );
    }
    if (activity.action === "added_comment" && details.textSnippet) {
      return (
        <Text style={styles.detailItalic}>
          &quot;{String(details.textSnippet)}...&quot;
        </Text>
      );
    }
    return null;
  };

  const renderActivityItem = ({
    item,
    index,
  }: {
    item: ActivityLog;
    index: number;
  }) => {
    const badge = getActionBadge(item.action);
    const userName =
      item.user?.name || item.user?.username || item.user?.email || "User";
    const formattedDate = new Date(item.createdAt).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const isLast = index === activities.length - 1;

    return (
      <View style={styles.timelineRow}>
        {/* Timeline Indicator Column */}
        <View style={styles.indicatorCol}>
          <View style={styles.bulletDot} />
          {!isLast && <View style={styles.verticalLine} />}
        </View>

        {/* Timeline Content */}
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.timeText}>{formattedDate}</Text>
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {badge.label}
              </Text>
            </View>
            <View style={{ flex: 1 }}>{formatDetails(item)}</View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={styles.titleRow}>
                <Icon name="time-outline" size={18} color="#111827" />
                <Text style={styles.title}>Activity History</Text>
              </View>
              {task && (
                <Text style={styles.taskTitle} numberOfLines={1}>
                  {task.title}
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="close-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Activity Timeline List */}
          {loading && !refreshing ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="small" color="#111827" />
              <Text style={styles.loadingText}>Loading history...</Text>
            </View>
          ) : activities.length === 0 ? (
            <View style={styles.centerContainer}>
              <Icon name="time-outline" size={36} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No activity recorded yet</Text>
              <Text style={styles.emptySubtitle}>
                Actions on this task will automatically be logged here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={activities}
              keyExtractor={(item) => item._id}
              renderItem={renderActivityItem}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#111827"
                />
              }
            />
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    minHeight: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  taskTitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    minHeight: 200,
  },
  loadingText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  indicatorCol: {
    width: 20,
    alignItems: "center",
    marginRight: 10,
  },
  bulletDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
    borderWidth: 2,
    borderColor: "#DBEAFE",
    marginTop: 4,
  },
  verticalLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#E5E7EB",
    marginTop: 4,
  },
  itemContent: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  timeText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  detailText: {
    fontSize: 11,
    color: "#4B5563",
  },
  detailBold: {
    fontWeight: "700",
    color: "#111827",
  },
  detailItalic: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#6B7280",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  doneBtn: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
