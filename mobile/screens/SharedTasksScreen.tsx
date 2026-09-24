import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Image,
} from "react-native";
import { getTasks, updateTask, deleteTask } from "../lib/taskApi";
import type { CreateTaskData, Task } from "../types/task";
import type { User } from "../types/auth";
import Icon from "../components/Icon";
import TaskCard from "../components/TaskCard";
import TaskStats from "../components/TaskStats";
import TaskFilters from "../components/TaskFilters";
import KanbanBoard from "../components/KanbanBoard";
import EditTaskModal from "../components/EditTaskModal";
import ShareTaskModal from "../components/ShareTaskModal";
import TaskAttachmentsModal from "../components/TaskAttachmentsModal";
import TaskCommentsModal from "../components/TaskCommentsModal";

interface SharedTasksScreenProps {
  user: User;
  onNavigateToProfile?: () => void;
}

export default function SharedTasksScreen({
  user,
  onNavigateToProfile,
}: SharedTasksScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  // Modals
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sharingTask, setSharingTask] = useState<Task | null>(null);
  const [attachmentTask, setAttachmentTask] = useState<Task | null>(null);
  const [commentingTask, setCommentingTask] = useState<Task | null>(null);

  const fetchMobileTasks = async () => {
    try {
      setError(null);
      const fetched = await getTasks();
      setTasks(fetched);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load shared tasks");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMobileTasks();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMobileTasks();
  };

  const currentUserId = String(user._id || (user as unknown as { id?: string }).id || "");

  // Shared Tasks Filter: task created by someone else OR has >1 members
  const sharedTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const creatorId =
        typeof task.createdBy === "object" && task.createdBy !== null
          ? String(task.createdBy._id)
          : String(task.createdBy || "");

      const isCreatedByOthers = currentUserId ? creatorId !== currentUserId : true;
      const hasMultipleMembers = Array.isArray(task.members) && task.members.length > 1;

      const isShared = isCreatedByOthers || hasMultipleMembers;
      if (!isShared) return false;

      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "priority-desc") {
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [tasks, currentUserId, searchQuery, statusFilter, priorityFilter, sortBy]);

  const handleStatusChange = async (
    task: Task,
    newStatus: "todo" | "in-progress" | "done"
  ) => {
    try {
      const updated = await updateTask(task._id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        labels: task.labels,
      });

      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? updated : t))
      );
    } catch (err) {
      console.error("Failed to update shared task status:", err);
    }
  };

  const handleEditSubmit = async (id: string, data: CreateTaskData) => {
    const updated = await updateTask(id, data);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Failed to delete shared task:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileHeaderBtn}
          onPress={onNavigateToProfile}
          activeOpacity={0.7}
        >
          <View style={styles.headerAvatar}>
            {user.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.headerAvatarImg} />
            ) : (
              <Text style={styles.headerAvatarText}>
                {user.username ? user.username.slice(0, 2).toUpperCase() : "U"}
              </Text>
            )}
          </View>

          <View>
            <Text style={styles.greeting}>Shared Workspace</Text>
            <Text style={styles.username}>Shared Tasks</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{sharedTasks.length} shared</Text>
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={styles.loadingText}>Loading shared tasks...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <TaskStats tasks={sharedTasks} />

          <TaskFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {viewMode === "kanban" ? (
            <KanbanBoard
              tasks={sharedTasks}
              onStatusChange={handleStatusChange}
              onEdit={(t) => setEditingTask(t)}
              onShare={(t) => setSharingTask(t)}
              onAttachments={(t) => setAttachmentTask(t)}
              onComments={(t) => setCommentingTask(t)}
              onDelete={handleDeleteTask}
            />
          ) : (
            <FlatList
              data={sharedTasks}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TaskCard
                  task={item}
                  onStatusChange={handleStatusChange}
                  onEdit={(t) => setEditingTask(t)}
                  onShare={(t) => setSharingTask(t)}
                  onAttachments={(t) => setAttachmentTask(t)}
                  onComments={(t) => setCommentingTask(t)}
                  onDelete={handleDeleteTask}
                />
              )}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#111827"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="people-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No shared tasks yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Tasks shared with you or created with collaborators will appear here.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      )}

      {/* Modals */}
      <EditTaskModal
        task={editingTask}
        visible={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditSubmit}
      />

      <ShareTaskModal
        task={sharingTask}
        visible={!!sharingTask}
        onClose={() => setSharingTask(null)}
        onMembersUpdated={fetchMobileTasks}
      />

      <TaskAttachmentsModal
        task={attachmentTask}
        visible={!!attachmentTask}
        onClose={() => setAttachmentTask(null)}
      />

      <TaskCommentsModal
        task={commentingTask}
        visible={!!commentingTask}
        onClose={() => setCommentingTask(null)}
        onCommentChange={fetchMobileTasks}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  profileHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerAvatarImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerAvatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  greeting: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  username: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#6B7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
