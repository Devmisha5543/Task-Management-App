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
import type { Task } from "@/types/task";

import Icon from "@/components/ui/Icon";

export default function DashboardPage() {
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

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
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
      if (sortBy === "due-soon") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "due-late") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Tasks</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your personal and collaborative tasks.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          + Create Task
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <TaskStats tasks={tasks} />

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
            Loading tasks...
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-700">
            <Icon name="clipboard" className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No tasks yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create your first task to start organizing your workflow.
          </p>
          <div className="mt-5">
            <Button onClick={() => setIsCreateOpen(true)}>
              Create Your First Task
            </Button>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">
            No tasks match your search and filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setPriorityFilter("all");
            }}
            className="mt-3 text-sm font-medium text-black underline"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "calendar" ? (
        <CalendarView
          tasks={filteredTasks}
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
          tasks={filteredTasks}
          onEdit={(t) => setEditingTask(t)}
          onShare={(t) => setSharingTask(t)}
          onAttachments={(t) => setAttachmentTask(t)}
          onComments={(t) => setCommentingTask(t)}
          onActivity={(t) => setActivityTask(t)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
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