"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useTaskStore } from "@/store/taskStore";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onShare?: (task: Task) => void;
  onAttachments?: (task: Task) => void;
  onComments?: (task: Task) => void;
  onActivity?: (task: Task) => void;
}

interface SortableTaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onShare?: (task: Task) => void;
  onAttachments?: (task: Task) => void;
  onComments?: (task: Task) => void;
  onActivity?: (task: Task) => void;
  onMove?: (task: Task, newStatus: "todo" | "in-progress" | "done") => void;
}

function SortableTaskItem({
  task,
  onEdit,
  onShare,
  onAttachments,
  onComments,
  onActivity,
  onMove,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle Overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-1 rounded-md bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 shadow-xs text-gray-400 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Drag to move task"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <TaskCard
        task={task}
        onEdit={onEdit}
        onShare={onShare}
        onAttachments={onAttachments}
        onComments={onComments}
        onActivity={onActivity}
      />

      {/* Quick Move Bar */}
      {onMove && (
        <div className="mt-1 flex items-center justify-end gap-1 px-1 text-xs text-gray-500 dark:text-zinc-400">
          <span className="text-[10px] text-gray-400 dark:text-zinc-500">Move:</span>
          {task.status !== "todo" && (
            <button
              onClick={() => onMove(task, "todo")}
              className="rounded bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-2 py-0.5 text-[11px] font-medium border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
            >
              To Do
            </button>
          )}
          {task.status !== "in-progress" && (
            <button
              onClick={() => onMove(task, "in-progress")}
              className="rounded bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-2 py-0.5 text-[11px] font-medium border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
            >
              In Progress
            </button>
          )}
          {task.status !== "done" && (
            <button
              onClick={() => onMove(task, "done")}
              className="rounded bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-2 py-0.5 text-[11px] font-medium border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  id,
  title,
  badgeClass,
  tasks,
  onEdit,
  onShare,
  onAttachments,
  onComments,
  onActivity,
  onMove,
}: {
  id: "todo" | "in-progress" | "done";
  title: string;
  badgeClass: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onShare?: (task: Task) => void;
  onAttachments?: (task: Task) => void;
  onComments?: (task: Task) => void;
  onActivity?: (task: Task) => void;
  onMove: (task: Task, newStatus: "todo" | "in-progress" | "done") => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border p-4 transition-colors ${
        isOver
          ? "border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-400/20"
          : "border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/50 shadow-2xs"
      }`}
    >
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">{title}</h3>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeClass}`}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task List in Column */}
      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-3 min-h-[300px]">
          {tasks.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 p-6 text-center text-xs text-gray-400 dark:text-zinc-500">
              Drop tasks here
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskItem
                key={task._id}
                task={task}
                onEdit={onEdit}
                onShare={onShare}
                onAttachments={onAttachments}
                onComments={onComments}
                onActivity={onActivity}
                onMove={onMove}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({
  tasks,
  onEdit,
  onShare,
  onAttachments,
  onComments,
  onActivity,
}: KanbanBoardProps) {
  const updateTask = useTaskStore((state) => state.updateTask);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const handleMove = async (
    task: Task,
    newStatus: "todo" | "in-progress" | "done"
  ) => {
    if (task.status === newStatus) return;
    try {
      await updateTask(task._id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        labels: task.labels,
      });
    } catch (err) {
      console.error("Failed to move task status:", err);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = tasks.find((t) => t._id === active.id);
    if (found) {
      setActiveTask(found);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    const draggedTask = tasks.find((t) => t._id === activeTaskId);
    if (!draggedTask) return;

    let targetStatus: "todo" | "in-progress" | "done" | null = null;

    if (["todo", "in-progress", "done"].includes(overId)) {
      targetStatus = overId as "todo" | "in-progress" | "done";
    } else {
      const targetTask = tasks.find((t) => t._id === overId);
      if (targetTask) {
        targetStatus = targetTask.status;
      }
    }

    if (targetStatus && targetStatus !== draggedTask.status) {
      await handleMove(draggedTask, targetStatus);
    }
  };

  const columns = [
    {
      id: "todo" as const,
      title: "To Do",
      badgeClass: "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700",
      tasks: todoTasks,
    },
    {
      id: "in-progress" as const,
      title: "In Progress",
      badgeClass: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
      tasks: inProgressTasks,
    },
    {
      id: "done" as const,
      title: "Done",
      badgeClass: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
      tasks: doneTasks,
    },
  ];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            badgeClass={col.badgeClass}
            tasks={col.tasks}
            onEdit={onEdit}
            onShare={onShare}
            onAttachments={onAttachments}
            onComments={onComments}
            onActivity={onActivity}
            onMove={handleMove}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 shadow-2xl rotate-2">
            <TaskCard
              task={activeTask}
              onEdit={onEdit}
              onShare={onShare}
              onAttachments={onAttachments}
              onComments={onComments}
              onActivity={onActivity}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

