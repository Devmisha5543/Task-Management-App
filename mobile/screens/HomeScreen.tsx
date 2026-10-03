import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../lib/taskApi";
import { getNotifications } from "../lib/notificationApi";
import type { CreateTaskData, Task } from "../types/task";
import type { User } from "../types/auth";
import Icon from "../components/Icon";
import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import NotificationModal from "../components/NotificationModal";
import AnalyticsModal from "../components/AnalyticsModal";
import { theme } from "../components/ui/theme";

interface HomeScreenProps {
  user: User;
  onLogout: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToTasks?: () => void;
  onNavigateToShared?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToSettings?: () => void;
}

export default function HomeScreen({
  user,
  onLogout,
  onNavigateToProfile,
  onNavigateToTasks,
  onNavigateToShared,
  onNavigateToCalendar,
  onNavigateToSettings,
}: HomeScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const fetched = await getTasks();
      setTasks(fetched);

      try {
        const notifData = await getNotifications();
        setUnreadNotifs(notifData.unreadCount || 0);
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      console.warn("Failed to load dashboard tasks:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleQuickToggleStatus = async (task: Task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    try {
      const updated = await updateTask(task._id, { status: nextStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, ...updated } : t))
      );
    } catch (err: unknown) {
      console.warn("Quick status update failed:", err);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const done = tasks.filter((t) => t.status === "done").length;
    const highPriority = tasks.filter((t) => t.priority === "high" && t.status !== "done").length;

    return { total, todo, inProgress, done, highPriority };
  }, [tasks]);

  // Urgent / Due Soon Tasks
  const urgentTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== "done")
      .sort((a, b) => {
        if (a.priority === "high" && b.priority !== "high") return -1;
        if (b.priority === "high" && a.priority !== "high") return 1;
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      })
      .slice(0, 4);
  }, [tasks]);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={onNavigateToProfile}
            activeOpacity={0.7}
          >
            <View style={styles.avatarWrapper}>
              {user.profilePhoto ? (
                <Image source={{ uri: user.profilePhoto }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>
                  {user.username ? user.username.slice(0, 2).toUpperCase() : "U"}
                </Text>
              )}
              <View style={styles.avatarOnlineDot} />
            </View>

            <View style={styles.greetingMeta}>
              <Text style={styles.greetingText}>{getGreeting()},</Text>
              <Text style={styles.usernameText}>{user.name || user.username}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setIsAnalyticsOpen(true)}
              accessibilityLabel="Analytics"
            >
              <Icon name="stats-chart-outline" size={18} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setIsNotifOpen(true)}
              accessibilityLabel="Notifications"
            >
              <Icon name="notifications-outline" size={18} color="#0F172A" />
              {unreadNotifs > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadNotifs > 9 ? "9+" : unreadNotifs}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={onNavigateToSettings}
              accessibilityLabel="Settings"
            >
              <Icon name="create-outline" size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary500} />
            <Text style={styles.loadingText}>Refreshing dashboard...</Text>
          </View>
        ) : (
          <>
            {/* Metric Cards Grid */}
            <View style={styles.metricsGrid}>
              {/* Total Tasks */}
              <TouchableOpacity
                style={[styles.metricCard, { backgroundColor: theme.colors.primary50, borderColor: theme.colors.primary100 }]}
                onPress={onNavigateToTasks}
                activeOpacity={0.7}
              >
                <View style={styles.metricCardTop}>
                  <Text style={[styles.metricNumber, { color: theme.colors.primary700 }]}>
                    {stats.total}
                  </Text>
                  <View style={[styles.metricIconBg, { backgroundColor: theme.colors.surface }]}>
                    <Icon name="list-outline" size={16} color={theme.colors.primary600} />
                  </View>
                </View>
                <Text style={[styles.metricLabel, { color: theme.colors.primary700 }]}>Total Tasks</Text>
              </TouchableOpacity>

              {/* In Progress */}
              <TouchableOpacity
                style={[styles.metricCard, { backgroundColor: theme.colors.infoLight, borderColor: theme.colors.infoBorder }]}
                onPress={onNavigateToTasks}
                activeOpacity={0.7}
              >
                <View style={styles.metricCardTop}>
                  <Text style={[styles.metricNumber, { color: theme.colors.info }]}>
                    {stats.inProgress}
                  </Text>
                  <View style={[styles.metricIconBg, { backgroundColor: theme.colors.surface }]}>
                    <Icon name="time-outline" size={16} color={theme.colors.info} />
                  </View>
                </View>
                <Text style={[styles.metricLabel, { color: theme.colors.info }]}>In Progress</Text>
              </TouchableOpacity>

              {/* Completed */}
              <TouchableOpacity
                style={[styles.metricCard, { backgroundColor: theme.colors.successLight, borderColor: theme.colors.successBorder }]}
                onPress={onNavigateToTasks}
                activeOpacity={0.7}
              >
                <View style={styles.metricCardTop}>
                  <Text style={[styles.metricNumber, { color: theme.colors.success }]}>
                    {stats.done}
                  </Text>
                  <View style={[styles.metricIconBg, { backgroundColor: theme.colors.surface }]}>
                    <Icon name="checkmark-outline" size={16} color={theme.colors.success} />
                  </View>
                </View>
                <Text style={[styles.metricLabel, { color: theme.colors.success }]}>Completed</Text>
              </TouchableOpacity>

              {/* High Priority */}
              <TouchableOpacity
                style={[styles.metricCard, { backgroundColor: theme.colors.dangerLight, borderColor: theme.colors.dangerBorder }]}
                onPress={onNavigateToTasks}
                activeOpacity={0.7}
              >
                <View style={styles.metricCardTop}>
                  <Text style={[styles.metricNumber, { color: theme.colors.danger }]}>
                    {stats.highPriority}
                  </Text>
                  <View style={[styles.metricIconBg, { backgroundColor: theme.colors.surface }]}>
                    <Icon name="alert-circle-outline" size={16} color={theme.colors.danger} />
                  </View>
                </View>
                <Text style={[styles.metricLabel, { color: theme.colors.danger }]}>High Priority</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Actions Bar */}
            <View style={styles.section}>
              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setIsCreateOpen(true)}
                  activeOpacity={0.8}
                >
                  <Icon name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionText}>New Task</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={onNavigateToTasks}
                  activeOpacity={0.7}
                >
                  <Icon name="list-outline" size={16} color="#0F172A" />
                  <Text style={styles.secondaryActionText}>My Tasks</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={onNavigateToShared}
                  activeOpacity={0.7}
                >
                  <Icon name="people-outline" size={16} color="#0F172A" />
                  <Text style={styles.secondaryActionText}>Shared</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={onNavigateToCalendar}
                  activeOpacity={0.7}
                >
                  <Icon name="calendar-outline" size={16} color="#0F172A" />
                  <Text style={styles.secondaryActionText}>Calendar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Urgent & Today's Deadlines Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Urgent &amp; Upcoming</Text>
                  <Text style={styles.sectionSubtitle}>Tasks requiring your attention</Text>
                </View>

                {onNavigateToTasks && (
                  <TouchableOpacity onPress={onNavigateToTasks}>
                    <Text style={styles.viewAllText}>View All &gt;</Text>
                  </TouchableOpacity>
                )}
              </View>

              {urgentTasks.length === 0 ? (
                <View style={styles.allCaughtUpCard}>
                  <View style={styles.caughtUpIconBg}>
                    <Icon name="checkmark-outline" size={20} color={theme.colors.success} />
                  </View>
                  <Text style={styles.caughtUpTitle}>You&apos;re all caught up!</Text>
                  <Text style={styles.caughtUpDesc}>No urgent pending tasks on your plate right now.</Text>
                </View>
              ) : (
                <View style={styles.tasksList}>
                  {urgentTasks.map((t) => (
                    <View key={t._id} style={styles.compactTaskCard}>
                      <TouchableOpacity
                        style={[
                          styles.checkboxBtn,
                          t.status === "done" && styles.checkboxBtnDone,
                        ]}
                        onPress={() => handleQuickToggleStatus(t)}
                      >
                        {t.status === "done" && (
                          <Icon name="checkmark-outline" size={12} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.compactTaskMeta}
                        onPress={() => setEditingTask(t)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.compactTaskTitle,
                            t.status === "done" && styles.compactTaskTitleDone,
                          ]}
                          numberOfLines={1}
                        >
                          {t.title}
                        </Text>
                        <View style={styles.compactTaskSubRow}>
                          <View
                            style={[
                              styles.priorityBadge,
                              t.priority === "high" && styles.priorityBadgeHigh,
                              t.priority === "medium" && styles.priorityBadgeMed,
                            ]}
                          >
                            <Text
                              style={[
                                styles.priorityBadgeText,
                                t.priority === "high" && styles.priorityBadgeTextHigh,
                                t.priority === "medium" && styles.priorityBadgeTextMed,
                              ]}
                            >
                              {t.priority.toUpperCase()}
                            </Text>
                          </View>

                          {t.dueDate && (
                            <Text style={styles.compactDueDateText}>
                              Due {new Date(t.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.compactEditBtn}
                        onPress={() => setEditingTask(t)}
                      >
                        <Icon name="create-outline" size={14} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Modals */}
        <CreateTaskModal
          visible={isCreateOpen}
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={async (data: CreateTaskData) => {
            try {
              const created = await createTask(data);
              setTasks((prev) => [created, ...prev]);
              setIsCreateOpen(false);
            } catch (err) {
              console.warn("Failed to create task:", err);
            }
          }}
        />

        {editingTask && (
          <EditTaskModal
            visible={!!editingTask}
            isOpen={!!editingTask}
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onUpdate={async (id: string, updates: Partial<CreateTaskData>) => {
              try {
                const updated = await updateTask(id, updates);
                setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...updated } : t)));
                setEditingTask(null);
              } catch (err) {
                console.warn("Failed to update task:", err);
              }
            }}
          />
        )}

        <NotificationModal
          isOpen={isNotifOpen}
          onClose={() => {
            setIsNotifOpen(false);
            setUnreadNotifs(0);
          }}
        />

        <AnalyticsModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          tasks={tasks}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary50,
    borderWidth: 1.5,
    borderColor: theme.colors.primary100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.primary600,
  },
  avatarOnlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  greetingMeta: {
    gap: 1,
  },
  greetingText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  usernameText: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...theme.shadows.sm,
  },
  notifBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: theme.colors.danger,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: "46%",
    padding: 14,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  metricCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: "800",
  },
  metricIconBg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 22,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  primaryActionBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.primary600,
    paddingVertical: 12,
    borderRadius: theme.radii.lg,
    ...theme.shadows.sm,
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    borderRadius: theme.radii.lg,
    ...theme.shadows.sm,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary600,
  },
  allCaughtUpCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...theme.shadows.sm,
  },
  caughtUpIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  caughtUpTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  caughtUpDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  tasksList: {
    gap: 10,
  },
  compactTaskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 12,
    gap: 10,
    ...theme.shadows.sm,
  },
  checkboxBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBtnDone: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  compactTaskMeta: {
    flex: 1,
    gap: 4,
  },
  compactTaskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  compactTaskTitleDone: {
    textDecorationLine: "line-through",
    color: theme.colors.textMuted,
  },
  compactTaskSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.successLight,
  },
  priorityBadgeHigh: {
    backgroundColor: theme.colors.dangerLight,
  },
  priorityBadgeMed: {
    backgroundColor: theme.colors.warningLight,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: theme.colors.success,
  },
  priorityBadgeTextHigh: {
    color: theme.colors.danger,
  },
  priorityBadgeTextMed: {
    color: theme.colors.warning,
  },
  compactDueDateText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  compactEditBtn: {
    padding: 6,
  },
});
