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

  const nowMidnight = new Date();
  nowMidnight.setHours(0, 0, 0, 0);
  const overdue = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false;
    return new Date(t.dueDate).getTime() < nowMidnight.getTime();
  }).length;

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs transition-colors">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={`grid grid-cols-2 gap-4 ${overdue > 0 ? "sm:grid-cols-5" : "sm:grid-cols-4"} flex-1`}>
          <div className="rounded-xl bg-gray-50 dark:bg-zinc-800/60 p-3.5 border border-gray-100 dark:border-zinc-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Total Tasks</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 p-3.5 border border-slate-100 dark:border-slate-800/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Do</p>
            <p className="mt-1 text-2xl font-bold text-slate-700 dark:text-slate-200">{todo}</p>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3.5 border border-amber-100 dark:border-amber-800/60">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">In Progress</p>
            <p className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-300">{inProgress}</p>
          </div>

          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 border border-emerald-100 dark:border-emerald-800/60">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Done</p>
            <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-300">{done}</p>
          </div>

          {overdue > 0 && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3.5 border border-rose-200 dark:border-rose-900/60">
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Overdue</p>
              <p className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-300">{overdue}</p>
            </div>
          )}
        </div>

        {/* Completion Progress Bar */}
        <div className="sm:w-48 border-t dark:border-zinc-800 pt-3 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
            <span>Overall Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
