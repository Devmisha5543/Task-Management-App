import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "./Icon";
import type { Task } from "../types/task";

interface TaskCardProps {
  task: Task;
  onStatusChange: (
    task: Task,
    newStatus: "todo" | "in-progress" | "done"
  ) => void;
  onEdit: (task: Task) => void;
  onShare: (task: Task) => void;
  onAttachments: (task: Task) => void;
  onComments: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onShare,
  onAttachments,
  onComments,
  onDelete,
}: TaskCardProps) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high":
        return { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5" };
      case "medium":
        return { bg: "#FEF3C7", text: "#D97706", border: "#FCD34D" };
      default:
        return { bg: "#D1FAE5", text: "#059669", border: "#6EE7B7" };
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);
  const memberCount = task.members ? task.members.length : 1;
  const commentsCount = task.commentsCount || 0;

  return (
    <View style={styles.card}>
      {/* Card Header: Title & Priority */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.title}>{task.title}</Text>
          {task.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.priorityBadge,
            {
              backgroundColor: priorityStyle.bg,
              borderColor: priorityStyle.border,
            },
          ]}
        >
          <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
            {task.priority.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Labels */}
      {task.labels && task.labels.length > 0 ? (
        <View style={styles.labelsRow}>
          {task.labels.map((label, idx) => (
            <View key={idx} style={styles.labelPill}>
              <Text style={styles.labelPillText}>#{label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Member, Comments & Attachment Stats Bar */}
      <View style={styles.metaRow}>
        <TouchableOpacity
          style={styles.metaBadge}
          onPress={() => onShare(task)}
        >
          <Icon name="people-outline" size={13} color="#4B5563" />
          <Text style={styles.metaBadgeText}>
            {memberCount} member{memberCount > 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.metaBadge}
          onPress={() => onComments(task)}
        >
          <Icon name="chatbubble-outline" size={13} color="#2563EB" />
          <Text style={[styles.metaBadgeText, { color: "#2563EB" }]}>
            {commentsCount} note{commentsCount !== 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.metaBadge}
          onPress={() => onAttachments(task)}
        >
          <Icon name="attach-outline" size={13} color="#4B5563" />
          <Text style={styles.metaBadgeText}>Files</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Status Buttons */}
      <View style={styles.statusRow}>
        {(["todo", "in-progress", "done"] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.statusBtn,
              task.status === s && styles.statusBtnActive,
            ]}
            onPress={() => onStatusChange(task, s)}
          >
            <Text
              style={[
                styles.statusBtnText,
                task.status === s && styles.statusBtnTextActive,
              ]}
            >
              {s === "in-progress" ? "In Progress" : s.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Footer Bar */}
      <View style={styles.actionsFooter}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onComments(task)}
          >
            <Icon name="chatbubble-outline" size={13} color="#374151" />
            <Text style={styles.actionBtnText}>Notes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEdit(task)}
          >
            <Icon name="create-outline" size={13} color="#374151" />
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onShare(task)}
          >
            <Icon name="person-add-outline" size={13} color="#374151" />
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(task._id)}
        >
          <Icon name="trash-outline" size={15} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 16,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "800",
  },
  labelsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  labelPill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  labelPillText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4B5563",
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  statusRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  statusBtnActive: {
    backgroundColor: "#111827",
  },
  statusBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
  },
  statusBtnTextActive: {
    color: "#FFFFFF",
  },
  actionsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
  },
  leftActions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  deleteBtn: {
    padding: 6,
  },
});
