import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "./Icon";
import { getTaskAnalytics, shareTasksData } from "../lib/analyticsApi";
import type { Task, TaskAnalytics } from "../types/task";

interface AnalyticsModalProps {
  isOpen?: boolean;
  visible?: boolean;
  onClose: () => void;
  tasks: Task[];
}

export default function AnalyticsModal({
  isOpen,
  visible,
  onClose,
  tasks,
}: AnalyticsModalProps) {
  const isModalVisible = Boolean(visible ?? isOpen);
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTaskAnalytics();
      setAnalytics(res.analytics);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const total = analytics?.total ?? tasks.length;
  const completionRate = analytics?.completionRate ?? 0;
  const done = analytics?.done ?? 0;
  const inProgress = analytics?.inProgress ?? 0;
  const todo = analytics?.todo ?? 0;
  const overdue = analytics?.overdue ?? 0;
  const highPriority = analytics?.priorityBreakdown?.high ?? 0;
  const medPriority = analytics?.priorityBreakdown?.medium ?? 0;
  const lowPriority = analytics?.priorityBreakdown?.low ?? 0;
  const thisWeekVelocity = analytics?.velocity?.completedThisWeek ?? 0;
  const lastWeekVelocity = analytics?.velocity?.completedLastWeek ?? 0;
  const subtasksRate = analytics?.subtasks?.rate ?? 0;
  const subtasksDone = analytics?.subtasks?.completed ?? 0;
  const subtasksTotal = analytics?.subtasks?.total ?? 0;

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Icon name="stats-chart-outline" size={18} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Productivity Analytics</Text>
              <Text style={styles.headerSubtitle}>Real-time performance & exports</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="close-outline" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        {loading && !analytics ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#111827" />
            <Text style={styles.loadingText}>Computing metrics...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={loadData}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* KPI 2x2 Grid */}
            <View style={styles.kpiGrid}>
              {/* Completion Rate */}
              <View style={[styles.kpiCard, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
                <Text style={[styles.kpiLabel, { color: "#166534" }]}>COMPLETION RATE</Text>
                <Text style={[styles.kpiValue, { color: "#14532d" }]}>{completionRate}%</Text>
                <Text style={[styles.kpiSub, { color: "#15803d" }]}>{done} of {total} done</Text>
              </View>

              {/* 7-Day Velocity */}
              <View style={[styles.kpiCard, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
                <Text style={[styles.kpiLabel, { color: "#1e40af" }]}>7-DAY VELOCITY</Text>
                <Text style={[styles.kpiValue, { color: "#1e3a8a" }]}>{thisWeekVelocity}</Text>
                <Text style={[styles.kpiSub, { color: "#2563eb" }]}>vs {lastWeekVelocity} last week</Text>
              </View>

              {/* Overdue */}
              <View
                style={[
                  styles.kpiCard,
                  overdue > 0
                    ? { backgroundColor: "#fef2f2", borderColor: "#fecaca" }
                    : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb" },
                ]}
              >
                <Text style={[styles.kpiLabel, overdue > 0 ? { color: "#991b1b" } : { color: "#6b7280" }]}>
                  OVERDUE TASKS
                </Text>
                <Text style={[styles.kpiValue, overdue > 0 ? { color: "#dc2626" } : { color: "#111827" }]}>
                  {overdue}
                </Text>
                <Text style={[styles.kpiSub, { color: "#6b7280" }]}>
                  {overdue > 0 ? "Past deadline" : "All on schedule"}
                </Text>
              </View>

              {/* Checklist Rate */}
              <View style={[styles.kpiCard, { backgroundColor: "#faf5ff", borderColor: "#e9d5ff" }]}>
                <Text style={[styles.kpiLabel, { color: "#6b21a8" }]}>CHECKLIST RATE</Text>
                <Text style={[styles.kpiValue, { color: "#581c87" }]}>{subtasksRate}%</Text>
                <Text style={[styles.kpiSub, { color: "#7e22ce" }]}>{subtasksDone} of {subtasksTotal} subtasks</Text>
              </View>
            </View>

            {/* Status Breakdown Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>STATUS DISTRIBUTION</Text>

              <View style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>Done</Text>
                  <Text style={styles.barCount}>{done} ({total ? Math.round((done / total) * 100) : 0}%)</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: "#10b981",
                        width: `${total ? (done / total) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>In Progress</Text>
                  <Text style={styles.barCount}>{inProgress} ({total ? Math.round((inProgress / total) * 100) : 0}%)</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: "#f59e0b",
                        width: `${total ? (inProgress / total) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>To Do</Text>
                  <Text style={styles.barCount}>{todo} ({total ? Math.round((todo / total) * 100) : 0}%)</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: "#94a3b8",
                        width: `${total ? (todo / total) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Priority Breakdown Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>PRIORITY BREAKDOWN</Text>

              <View style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>High Priority</Text>
                  <Text style={styles.barCount}>{highPriority} ({total ? Math.round((highPriority / total) * 100) : 0}%)</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: "#ef4444",
                        width: `${total ? (highPriority / total) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>Medium Priority</Text>
                  <Text style={styles.barCount}>{medPriority} ({total ? Math.round((medPriority / total) * 100) : 0}%)</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: "#f97316",
                        width: `${total ? (medPriority / total) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>Low Priority</Text>
                  <Text style={styles.barCount}>{lowPriority} ({total ? Math.round((lowPriority / total) * 100) : 0}%)</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: "#10b981",
                        width: `${total ? (lowPriority / total) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Export Actions Section */}
            <View style={styles.exportCard}>
              <Text style={styles.exportTitle}>Export Task Data</Text>
              <Text style={styles.exportSubtitle}>
                Download or share your active workspace tasks ({tasks.length} total)
              </Text>

              <View style={styles.exportButtons}>
                <TouchableOpacity
                  onPress={() => shareTasksData(tasks, "csv")}
                  style={styles.exportBtn}
                >
                  <Icon name="download-outline" size={16} color="#059669" />
                  <Text style={styles.exportBtnText}>Share CSV</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => shareTasksData(tasks, "json")}
                  style={styles.exportBtn}
                >
                  <Icon name="download-outline" size={16} color="#2563eb" />
                  <Text style={styles.exportBtnText}>Share JSON</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={loadData} style={styles.refreshBtn}>
            <Icon name="repeat-outline" size={14} color="#374151" />
            <Text style={styles.refreshText}>Refresh Metrics</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#6b7280",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#6b7280",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    fontSize: 12,
    color: "#b91c1c",
  },
  retryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#991b1b",
    textDecorationLine: "underline",
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiCard: {
    width: "48%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 0.5,
  },
  barItem: {
    gap: 4,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barLabel: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  barCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  barTrack: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  exportCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
  },
  exportTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  exportSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
    marginBottom: 10,
  },
  exportButtons: {
    flexDirection: "row",
    gap: 8,
  },
  exportBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 9,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#ffffff",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  doneBtn: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doneBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
});
