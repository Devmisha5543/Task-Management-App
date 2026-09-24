"use client";

import { useEffect, useMemo, useState } from "react";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import TaskAttachmentsModal from "@/components/tasks/TaskAttachmentsModal";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskStats from "@/components/tasks/TaskStats";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import type { Task } from "@/types/task";

export default function SharedTasksPage() {
  const user = useAuthStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const error = useTaskStore((state) => state.error);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [attachmentTask, setAttachmentTask] = useState<Task | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const currentUserId = useMemo(() => {
    if (!user) return "";
    return String(user.id || (user as unknown as { _id?: string })._id || "");
  }, [user]);

  const sharedTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const creatorId =
        typeof task.createdBy === "object" && task.createdBy !== null
          ? String((task.createdBy as unknown as { _id?: string; id?: string })._id || (task.createdBy as unknown as { _id?: string; id?: string }).id || "")
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shared Tasks</h1>
        <p className="mt-1 text-sm text-gray-600">
          Tasks shared with team members or assigned to you.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200">
          {error}
        </div>
      )}

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

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-gray-200 bg-white p-12 text-gray-500 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
            Loading shared tasks...
          </div>
        </div>
      ) : sharedTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
            👥
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No shared tasks yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            When tasks have multiple collaborators or are shared with you, they will appear here.
          </p>
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanBoard
          tasks={sharedTasks}
          onEdit={(t) => setEditingTask(t)}
          onAttachments={(t) => setAttachmentTask(t)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sharedTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={(t) => setEditingTask(t)}
              onAttachments={(t) => setAttachmentTask(t)}
            />
          ))}
        </div>
      )}

      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
      />

      <TaskAttachmentsModal
        task={attachmentTask}
        isOpen={!!attachmentTask}
        onClose={() => setAttachmentTask(null)}
      />
    </div>
  );
}