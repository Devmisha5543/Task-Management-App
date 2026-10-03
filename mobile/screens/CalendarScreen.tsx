import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTasks, updateTask, deleteTask } from "../lib/taskApi";
import type { Task, CreateTaskData } from "../types/task";
import type { User } from "../types/auth";
import Icon from "../components/Icon";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import ShareTaskModal from "../components/ShareTaskModal";
import TaskAttachmentsModal from "../components/TaskAttachmentsModal";
import TaskCommentsModal from "../components/TaskCommentsModal";
import TaskActivityModal from "../components/TaskActivityModal";

interface CalendarScreenProps {
  user: User;
  onNavigateToProfile?: () => void;
}

export default function CalendarScreen({
  user,
  onNavigateToProfile,
}: CalendarScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected date state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [activeMonthDate, setActiveMonthDate] = useState<Date>(() => new Date());

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sharingTask, setSharingTask] = useState<Task | null>(null);
  const [attachmentTask, setAttachmentTask] = useState<Task | null>(null);
  const [commentingTask, setCommentingTask] = useState<Task | null>(null);
  const [activityTask, setActivityTask] = useState<Task | null>(null);

  const fetchMobileTasks = async () => {
    try {
      setError(null);
      const fetched = await getTasks();
      setTasks(fetched);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load tasks");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMobileTasks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMobileTasks();
  };

  // Month calculations for day strip
  const monthDays = useMemo(() => {
    const year = activeMonthDate.getFullYear();
    const month = activeMonthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; dayName: string; isToday: boolean }[] = [];
    const todayStr = new Date().toISOString().split("T")[0];

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const dayName = d.toLocaleDateString("en-US", { weekday: "narrow" });
      days.push({
        dateStr,
        dayNum: i,
        dayName,
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [activeMonthDate]);

  // Tasks for the selected date
  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      return t.dueDate.startsWith(selectedDate);
    });
  }, [tasks, selectedDate]);

  // Tasks without a due date
  const unscheduledTasks = useMemo(() => {
    return tasks.filter((t) => !t.dueDate);
  }, [tasks]);

  // Count scheduled tasks per date
  const taskCountPerDate = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      if (t.dueDate) {
        const key = t.dueDate.split("T")[0];
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [tasks]);

  const handlePrevMonth = () => {
    setActiveMonthDate((prev) => {
      const copy = new Date(prev);
      copy.setMonth(copy.getMonth() - 1);
      return copy;
    });
  };

  const handleNextMonth = () => {
    setActiveMonthDate((prev) => {
      const copy = new Date(prev);
      copy.setMonth(copy.getMonth() + 1);
      return copy;
    });
  };

  const handleToday = () => {
    const today = new Date();
    setActiveMonthDate(today);
    setSelectedDate(today.toISOString().split("T")[0]);
  };

  const handleStatusChange = async (
    task: Task,
    newStatus: "todo" | "in-progress" | "done"
  ) => {
    try {
      await updateTask(task._id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );
    } catch {
      fetchMobileTasks();
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch {
      fetchMobileTasks();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Calendar & Deadlines</Text>
          <Text style={styles.subtitle}>
            {activeMonthDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.todayButton}
            onPress={handleToday}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setIsCreateOpen(true)}
          >
            <Icon name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Month Navigator Controls */}
      <View style={styles.monthNav}>
        <TouchableOpacity
          style={styles.navArrow}
          onPress={handlePrevMonth}
        >
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.monthNavText}>
          {activeMonthDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity
          style={styles.navArrow}
          onPress={handleNextMonth}
        >
          <Text style={styles.navArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Day Strip */}
      <View style={styles.dayStripContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayStrip}
        >
          {monthDays.map((d) => {
            const isSelected = d.dateStr === selectedDate;
            const count = taskCountPerDate[d.dateStr] || 0;

            return (
              <TouchableOpacity
                key={d.dateStr}
                onPress={() => setSelectedDate(d.dateStr)}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  d.isToday && !isSelected && styles.dayCellToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayName,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {d.dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNum,
                    isSelected && styles.dayTextSelected,
                    d.isToday && !isSelected && styles.dayNumToday,
                  ]}
                >
                  {d.dayNum}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.countDot,
                      isSelected && styles.countDotSelected,
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Day Agenda Content */}
      <View style={styles.contentHeader}>
        <Text style={styles.sectionTitle}>
          Tasks for{" "}
          {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.sectionBadge}>
          {tasksForSelectedDate.length} scheduled
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={styles.loadingText}>Loading calendar schedule...</Text>
        </View>
      ) : (
        <FlatList
          data={tasksForSelectedDate}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-outline" size={36} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No tasks for this day</Text>
              <Text style={styles.emptySubtitle}>
                Tap + above to schedule a task for this date.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              currentUserId={user.id}
              onStatusChange={handleStatusChange}
              onEdit={(t) => setEditingTask(t)}
              onShare={(t) => setSharingTask(t)}
              onAttachments={(t) => setAttachmentTask(t)}
              onComments={(t) => setCommentingTask(t)}
              onActivity={(t) => setActivityTask(t)}
              onDelete={handleDelete}
            />
          )}
        />
      )}

      {/* Modals */}
      <CreateTaskModal
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newTask) => setTasks((prev) => [newTask, ...prev])}
      />

      <EditTaskModal
        visible={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdated={(updated) =>
          setTasks((prev) =>
            prev.map((t) => (t._id === updated._id ? updated : t))
          )
        }
      />

      <ShareTaskModal
        visible={!!sharingTask}
        task={sharingTask}
        onClose={() => setSharingTask(null)}
        onUpdated={(updated) =>
          setTasks((prev) =>
            prev.map((t) => (t._id === updated._id ? updated : t))
          )
        }
      />

      <TaskAttachmentsModal
        visible={!!attachmentTask}
        task={attachmentTask}
        onClose={() => setAttachmentTask(null)}
      />

      <TaskCommentsModal
        visible={!!commentingTask}
        task={commentingTask}
        currentUserId={user.id}
        onClose={() => setCommentingTask(null)}
        onCommentChange={fetchMobileTasks}
      />

      <TaskActivityModal
        visible={!!activityTask}
        task={activityTask}
        onClose={() => setActivityTask(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  todayButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  todayButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  createButton: {
    backgroundColor: "#111827",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  navArrow: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  navArrowText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    lineHeight: 20,
  },
  monthNavText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  dayStripContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 10,
  },
  dayStrip: {
    paddingHorizontal: 12,
    gap: 8,
  },
  dayCell: {
    width: 44,
    height: 58,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dayCellSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  dayCellToday: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  dayName: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 2,
  },
  dayNum: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  dayNumToday: {
    color: "#2563EB",
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  countDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3B82F6",
    marginTop: 4,
  },
  countDotSelected: {
    backgroundColor: "#FFFFFF",
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
