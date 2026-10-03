import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../lib/taskApi";
import type { CreateTaskData, Task } from "../types/task";
import type { User } from "../types/auth";
import Icon from "../components/Icon";
import TaskCard from "../components/TaskCard";
import KanbanBoard from "../components/KanbanBoard";
import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import ShareTaskModal from "../components/ShareTaskModal";
import TaskAttachmentsModal from "../components/TaskAttachmentsModal";
import TaskCommentsModal from "../components/TaskCommentsModal";
import TaskActivityModal from "../components/TaskActivityModal";
import { theme } from "../components/ui/theme";

interface MyTasksScreenProps {
  user: User;
  onNavigateToProfile?: () => void;
}

export default function MyTasksScreen({
  user,
  onNavigateToProfile,
}: MyTasksScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "in-progress" | "done">("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sharingTask, setSharingTask] = useState<Task | null>(null);
  const [attachmentTask, setAttachmentTask] = useState<Task | null>(null);
  const [commentingTask, setCommentingTask] = useState<Task | null>(null);
  const [activityTask, setActivityTask] = useState<Task | null>(null);

  const fetchMyTasks = async () => {
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
    fetchMyTasks();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMyTasks();
  };

  const handleStatusChange = async (
    task: Task,
    newStatus: "todo" | "in-progress" | "done"
  ) => {
    try {
      const updated = await updateTask(task._id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, ...updated } : t))
      );
    } catch (err: unknown) {
      console.warn("Failed to update status:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err: unknown) {
      console.warn("Failed to delete task:", err);
    }
  };

  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      const created = await createTask(data);
      setTasks((prev) => [created, ...prev]);
      setIsCreateOpen(false);
    } catch (err: unknown) {
      console.warn("Failed to create task:", err);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<CreateTaskData>) => {
    try {
      const updated = await updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...updated } : t)));
      setEditingTask(null);
    } catch (err: unknown) {
      console.warn("Failed to update task:", err);
    }
  };

  // Status counts
  const counts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Tasks</Text>
            <Text style={styles.headerSubtitle}>
              {counts.all} total • {counts.todo + counts.inProgress} active
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[styles.viewToggleBtn, viewMode === "list" && styles.viewToggleBtnActive]}
                onPress={() => setViewMode("list")}
              >
                <Icon name="list-outline" size={16} color={viewMode === "list" ? "#0F172A" : "#94A3B8"} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewToggleBtn, viewMode === "kanban" && styles.viewToggleBtnActive]}
                onPress={() => setViewMode("kanban")}
              >
                <Icon name="grid-outline" size={16} color={viewMode === "kanban" ? "#0F172A" : "#94A3B8"} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.newTaskBtn}
              onPress={() => setIsCreateOpen(true)}
              activeOpacity={0.8}
            >
              <Icon name="add" size={16} color="#FFFFFF" />
              <Text style={styles.newTaskBtnText}>New</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks by title or details..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsContainer}>
          <TouchableOpacity
            style={[styles.pill, statusFilter === "all" && styles.pillActive]}
            onPress={() => setStatusFilter("all")}
          >
            <Text style={[styles.pillText, statusFilter === "all" && styles.pillTextActive]}>
              All ({counts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, statusFilter === "todo" && styles.pillActive]}
            onPress={() => setStatusFilter("todo")}
          >
            <Text style={[styles.pillText, statusFilter === "todo" && styles.pillTextActive]}>
              To Do ({counts.todo})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, statusFilter === "in-progress" && styles.pillActive]}
            onPress={() => setStatusFilter("in-progress")}
          >
            <Text style={[styles.pillText, statusFilter === "in-progress" && styles.pillTextActive]}>
              In Progress ({counts.inProgress})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, statusFilter === "done" && styles.pillActive]}
            onPress={() => setStatusFilter("done")}
          >
            <Text style={[styles.pillText, statusFilter === "done" && styles.pillTextActive]}>
              Completed ({counts.done})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Priority Filter Row */}
        <View style={styles.priorityFilterRow}>
          <Text style={styles.filterLabel}>Priority:</Text>
          {["all", "high", "medium", "low"].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityChip,
                priorityFilter === p && styles.priorityChipActive,
              ]}
              onPress={() => setPriorityFilter(p)}
            >
              <Text
                style={[
                  styles.priorityChipText,
                  priorityFilter === p && styles.priorityChipTextActive,
                ]}
              >
                {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Body */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary500} />
            <Text style={styles.loadingText}>Loading your tasks...</Text>
          </View>
        ) : viewMode === "kanban" ? (
          <KanbanBoard
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onEdit={(t) => setEditingTask(t)}
            onShare={(t) => setSharingTask(t)}
            onAttachments={(t) => setAttachmentTask(t)}
            onComments={(t) => setCommentingTask(t)}
            onActivity={(t) => setActivityTask(t)}
            onDelete={handleDeleteTask}
          />
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onStatusChange={handleStatusChange}
                onEdit={(t) => setEditingTask(t)}
                onShare={(t) => setSharingTask(t)}
                onAttachments={(t) => setAttachmentTask(t)}
                onComments={(t) => setCommentingTask(t)}
                onActivity={(t) => setActivityTask(t)}
                onDelete={handleDeleteTask}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                  <Icon name="document-text-outline" size={32} color={theme.colors.primary500} />
                </View>
                <Text style={styles.emptyTitle}>No tasks found</Text>
                <Text style={styles.emptyDesc}>
                  {searchQuery
                    ? "Try adjusting your search query or filters"
                    : "Get started by adding your first task!"}
                </Text>
                <TouchableOpacity
                  style={styles.emptyCreateBtn}
                  onPress={() => setIsCreateOpen(true)}
                >
                  <Icon name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.emptyCreateBtnText}>Create New Task</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {/* Modals */}
        <CreateTaskModal
          visible={isCreateOpen}
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateTask}
        />

        {editingTask && (
          <EditTaskModal
            visible={!!editingTask}
            isOpen={!!editingTask}
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onUpdate={handleUpdateTask}
          />
        )}

        {sharingTask && (
          <ShareTaskModal
            visible={!!sharingTask}
            isOpen={!!sharingTask}
            task={sharingTask}
            onClose={() => setSharingTask(null)}
            onTaskUpdated={(updated) => {
              setTasks((prev) =>
                prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t))
              );
            }}
          />
        )}

        {attachmentTask && (
          <TaskAttachmentsModal
            visible={!!attachmentTask}
            isOpen={!!attachmentTask}
            task={attachmentTask}
            onClose={() => setAttachmentTask(null)}
            onTaskUpdated={(updated) => {
              setTasks((prev) =>
                prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t))
              );
            }}
          />
        )}

        {commentingTask && (
          <TaskCommentsModal
            visible={!!commentingTask}
            isOpen={!!commentingTask}
            task={commentingTask}
            onClose={() => setCommentingTask(null)}
          />
        )}

        {activityTask && (
          <TaskActivityModal
            visible={!!activityTask}
            isOpen={!!activityTask}
            task={activityTask}
            onClose={() => setActivityTask(null)}
          />
        )}
      </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.md,
    padding: 3,
  },
  viewToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.radii.sm,
  },
  viewToggleBtnActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  newTaskBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primary600,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radii.md,
    ...theme.shadows.sm,
  },
  newTaskBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    height: 42,
    gap: 8,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  filterPillsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    backgroundColor: theme.colors.primary50,
    borderColor: theme.colors.primary500,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  pillTextActive: {
    color: theme.colors.primary600,
    fontWeight: "700",
  },
  priorityFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 6,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  priorityChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radii.sm,
    backgroundColor: "transparent",
  },
  priorityChipActive: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  priorityChipText: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  priorityChipTextActive: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    maxWidth: 240,
  },
  emptyCreateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary600,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radii.lg,
    marginTop: 8,
  },
  emptyCreateBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
