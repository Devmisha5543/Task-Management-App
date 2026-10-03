"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import CalendarView from "@/components/tasks/CalendarView";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import TaskAttachmentsModal from "@/components/tasks/TaskAttachmentsModal";
import TaskCommentsModal from "@/components/tasks/TaskCommentsModal";
import TaskActivityModal from "@/components/tasks/TaskActivityModal";
import { useTaskStore } from "@/store/taskStore";
import type { Task } from "@/types/task";

export default function CalendarPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const error = useTaskStore((state) => state.error);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialDate, setCreateInitialDate] = useState<string | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [attachmentTask, setAttachmentTask] = useState<Task | null>(null);
  const [commentingTask, setCommentingTask] = useState<Task | null>(null);
  const [activityTask, setActivityTask] = useState<Task | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
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
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const scheduledCount = useMemo(() => {
    return tasks.filter((t) => !!t.dueDate).length;
  }, [tasks]);

  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.status === "done").length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Calendar & Timeline
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Interactive
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Schedule deadlines, track scheduled milestones, and manage task timelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setCreateInitialDate(undefined);
              setIsCreateOpen(true);
            }}
          >
            + Create Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-medium text-gray-500">Total Tasks</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{tasks.length}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-medium text-gray-500">Scheduled Deadlines</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{scheduledCount}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-medium text-gray-500">Unscheduled</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {tasks.length - scheduledCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-medium text-gray-500">Overall Progress</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{completionRate}%</span>
            <span className="text-xs text-gray-400">completed</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search calendar tasks..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-gray-200 bg-white p-12 text-gray-500 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
            Loading calendar...
          </div>
        </div>
      ) : (
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
