import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import TaskCard from "./TaskCard";
import Icon from "./Icon";
import type { Task } from "../types/task";

interface KanbanBoardProps {
  tasks: Task[];
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

export default function KanbanBoard({
  tasks,
  onStatusChange,
  onEdit,
  onShare,
  onAttachments,
  onComments,
  onDelete,
}: KanbanBoardProps) {
  const [activeTab, setActiveTab] = useState<"todo" | "in-progress" | "done">(
    "todo"
  );

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const columns = [
    { id: "todo", title: "To Do", tasks: todoTasks, color: "#6B7280" },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: inProgressTasks,
      color: "#D97706",
    },
    { id: "done", title: "Completed", tasks: doneTasks, color: "#059669" },
  ] as const;

  const currentColumn = columns.find((c) => c.id === activeTab)!;

  return (
    <View style={styles.container}>
      {/* Column Switcher Tabs */}
      <View style={styles.tabBar}>
        {columns.map((col) => (
          <TouchableOpacity
            key={col.id}
            style={[
              styles.tab,
              activeTab === col.id && {
                backgroundColor: col.color,
                borderColor: col.color,
              },
            ]}
            onPress={() => setActiveTab(col.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === col.id && styles.tabTextActive,
              ]}
            >
              {col.title} ({col.tasks.length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Column Content */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.columnHeader}>
          <Text style={[styles.columnTitle, { color: currentColumn.color }]}>
            {currentColumn.title}
          </Text>
          <Text style={styles.badge}>{currentColumn.tasks.length} tasks</Text>
        </View>

        {currentColumn.tasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="checkbox-outline" size={28} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              No tasks in {currentColumn.title}
            </Text>
          </View>
        ) : (
          currentColumn.tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onShare={onShare}
              onAttachments={onAttachments}
              onComments={onComments}
              onDelete={onDelete}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  columnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  badge: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  emptyCard: {
    padding: 30,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "600",
  },
});
