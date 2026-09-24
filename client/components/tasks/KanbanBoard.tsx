"use client";

import { useTaskStore } from "@/store/taskStore";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onShare?: (task: Task) => void;
  onAttachments?: (task: Task) => void;
  onComments?: (task: Task) => void;
}

export default function KanbanBoard({
  tasks,
  onEdit,
  onShare,
  onAttachments,
  onComments,
}: KanbanBoardProps) {
  const updateTask = useTaskStore((state) => state.updateTask);

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const handleMove = async (task: Task, newStatus: "todo" | "in-progress" | "done") => {
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

  const columns = [
    {
      id: "todo",
      title: "To Do",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      tasks: todoTasks,
    },
    {
      id: "in-progress",
      title: "In Progress",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
      tasks: inProgressTasks,
    },
    {
      id: "done",
      title: "Done",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      tasks: doneTasks,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {columns.map((col) => (
        <div
          key={col.id}
          className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50/70 p-4 shadow-2xs"
        >
          {/* Column Header */}
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{col.title}</h3>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${col.badgeClass}`}
              >
                {col.tasks.length}
              </span>
            </div>
          </div>

          {/* Task List in Column */}
          <div className="flex flex-1 flex-col gap-3 min-h-[300px]">
            {col.tasks.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                No tasks in {col.title}
              </div>
            ) : (
              col.tasks.map((task) => (
                <div key={task._id} className="relative group">
                  <TaskCard
                    task={task}
                    onEdit={onEdit}
                    onShare={onShare}
                    onAttachments={onAttachments}
                    onComments={onComments}
                  />

                  {/* Quick Kanban Move Bar on Card Hover */}
                  <div className="mt-1 flex items-center justify-end gap-1 px-1 text-xs text-gray-500">
                    <span className="text-[10px] text-gray-400">Move:</span>
                    {col.id !== "todo" && (
                      <button
                        onClick={() => handleMove(task, "todo")}
                        className="rounded bg-white px-2 py-0.5 text-[11px] font-medium border border-gray-200 hover:bg-gray-100"
                      >
                        To Do
                      </button>
                    )}
                    {col.id !== "in-progress" && (
                      <button
                        onClick={() => handleMove(task, "in-progress")}
                        className="rounded bg-white px-2 py-0.5 text-[11px] font-medium border border-gray-200 hover:bg-gray-100"
                      >
                        In Progress
                      </button>
                    )}
                    {col.id !== "done" && (
                      <button
                        onClick={() => handleMove(task, "done")}
                        className="rounded bg-white px-2 py-0.5 text-[11px] font-medium border border-gray-200 hover:bg-gray-100"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
