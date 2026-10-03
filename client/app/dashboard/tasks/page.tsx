"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import CalendarView from "@/components/tasks/CalendarView";
import ShareTaskModal from "@/components/tasks/ShareTaskModal";
import TaskAttachmentsModal from "@/components/tasks/TaskAttachmentsModal";
import TaskCommentsModal from "@/components/tasks/TaskCommentsModal";
import TaskActivityModal from "@/components/tasks/TaskActivityModal";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskStats from "@/components/tasks/TaskStats";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import type { Task } from "@/types/task";
import Icon from "@/components/ui/Icon";

export default function MyTasksPage() {
  const user = useAuthStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const error = useTaskStore((state) => state.error);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialDate, setCreateInitialDate] = useState<string | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sharingTask, setSharingTask] = useState<Task | null>(null);
  const [attachmentTask, setAttachmentTask] = useState<Task | null>(null);
  const [commentingTask, setCommentingTask] = useState<Task | null>(null);
  const [activityTask, setActivityTask] = useState<Task | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "kanban" | "calendar">("grid");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const currentUserId = useMemo(() => {
    if (!user) return "";
    return String(user.id || (user as unknown as { _id?: string })._id || "");
  }, [user]);

  const personalTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const creatorId =
        typeof task.createdBy === "object" && task.createdBy !== null
          ? String((task.createdBy as unknown as { _id?: string; id?: string })._id || (task.createdBy as unknown as { _id?: string; id?: string }).id || "")
          : String(task.createdBy || "");

      const isOwner = currentUserId ? creatorId === currentUserId : true;
      if (!isOwner) return false;

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

  return (
    <div className="animate-in fade-in duration-200">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
            Tasks created and owned by you.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 shadow-sm"
        >
          <Icon name="plus" className="h-4 w-4" />
          <span>Create Task</span>
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/40 p-4 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60">
          {error}
        </div>
      )}

      <TaskStats tasks={personalTasks} />

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

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-gray-500 dark:text-zinc-400 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-black dark:border-white border-t-transparent"></span>
            Loading tasks...
          </div>
        </div>
      ) : personalTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-12 text-center">
          <p className="text-gray-500 dark:text-zinc-400">No personal tasks found.</p>
          <div className="mt-4">
            <Button onClick={() => setIsCreateOpen(true)}>
              Create Task
            </Button>
          </div>
        </div>
      ) : viewMode === "calendar" ? (
        <CalendarView
          tasks={personalTasks}
          onEdit={(t) => setEditingTask(t)}
          onCreateForDate={(dateStr) => {
            setCreateInitialDate(dateStr);
            setIsCreateOpen(true);
          }}
          onAttachments={(t) => setAttachmentTask(t)}
          onComments={(t) => setCommentingTask(t)}
          onActivity={(t) => setActivityTask(t)}
        />
      ) : viewMode === "kanban" ? (
        <KanbanBoard
          tasks={personalTasks}
          onEdit={(t) => setEditingTask(t)}
          onShare={(t) => setSharingTask(t)}
          onAttachments={(t) => setAttachmentTask(t)}
          onComments={(t) => setCommentingTask(t)}
          onActivity={(t) => setActivityTask(t)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personalTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={(t) => setEditingTask(t)}
              onShare={(t) => setSharingTask(t)}
              onAttachments={(t) => setAttachmentTask(t)}
              onComments={(t) => setCommentingTask(t)}
              onActivity={(t) => setActivityTask(t)}
            />
          ))}
        </div>
      )}

      <CreateTaskModal
        isOpen={isCreateOpen}
        initialDueDate={createInitialDate}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateInitialDate(undefined);
        }}
      />

      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
      />

      <ShareTaskModal
        task={sharingTask}
        isOpen={!!sharingTask}
        onClose={() => setSharingTask(null)}
      />

      <TaskAttachmentsModal
        task={attachmentTask}
        isOpen={!!attachmentTask}
        onClose={() => setAttachmentTask(null)}
      />

      <TaskCommentsModal
        task={commentingTask}
        isOpen={!!commentingTask}
        onClose={() => setCommentingTask(null)}
        onCommentChange={fetchTasks}
      />

      <TaskActivityModal
        task={activityTask}
        isOpen={!!activityTask}
        onClose={() => setActivityTask(null)}
      />
    </div>
  );
}