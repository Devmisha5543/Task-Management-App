import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { Task } from "../types/task";

interface TaskStatsProps {
  tasks: Task[];
}

export default function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const highPriority = tasks.filter((t) => t.priority === "high").length;

  const stats = [
    { label: "Total Tasks", count: total, color: "#3B82F6", bg: "#EFF6FF" },
    { label: "To Do", count: todo, color: "#6B7280", bg: "#F3F4F6" },
    { label: "In Progress", count: inProgress, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Completed", count: done, color: "#10B981", bg: "#D1FAE5" },
    { label: "High Priority", count: highPriority, color: "#EF4444", bg: "#FEE2E2" },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {stats.map((stat, i) => (
        <View key={i} style={[styles.card, { backgroundColor: stat.bg }]}>
          <Text style={[styles.count, { color: stat.color }]}>{stat.count}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  card: {
    minWidth: 105,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  count: {
    fontSize: 20,
    fontWeight: "800",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 2,
  },
});
