"use client";

import type { Task } from "@/types/task";

interface TaskStatsProps {
  tasks: Task[];
}

export default function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const done = tasks.filter((t) => t.status === "done").length;

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 flex-1">
          <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Tasks</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{total}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Do</p>
            <p className="mt-1 text-2xl font-bold text-slate-700">{todo}</p>
          </div>

          <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-100">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">{inProgress}</p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Done</p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">{done}</p>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="sm:w-48 border-t pt-3 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
            <span>Overall Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-black transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
