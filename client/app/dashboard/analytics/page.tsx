"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { getTaskAnalytics, exportTasksToCSV, exportTasksToJSON } from "@/lib/analyticsApi";
import { useTaskStore } from "@/store/taskStore";
import type { TaskAnalytics } from "@/types/task";

export default function AnalyticsPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);

  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTaskAnalytics();
      setAnalytics(res.analytics);
    } catch (err: unknown) {
      console.error("Failed to load task analytics:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    loadAnalytics();
  }, [fetchTasks]);

  const totalTasks = analytics?.total ?? tasks.length;
  const completionRate = analytics?.completionRate ?? 0;
  const todoCount = analytics?.todo ?? 0;
  const inProgressCount = analytics?.inProgress ?? 0;
  const doneCount = analytics?.done ?? 0;
  const overdueCount = analytics?.overdue ?? 0;
  const highPriority = analytics?.priorityBreakdown?.high ?? 0;
  const medPriority = analytics?.priorityBreakdown?.medium ?? 0;
  const lowPriority = analytics?.priorityBreakdown?.low ?? 0;

  const thisWeekVelocity = analytics?.velocity?.completedThisWeek ?? 0;
  const lastWeekVelocity = analytics?.velocity?.completedLastWeek ?? 0;
  const velocityDiff = thisWeekVelocity - lastWeekVelocity;

  const subtasksTotal = analytics?.subtasks?.total ?? 0;
  const subtasksDone = analytics?.subtasks?.completed ?? 0;
  const subtasksRate = analytics?.subtasks?.rate ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Productivity & Analytics Hub
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-zinc-300">
            Real-time completion metrics, team velocity, and workspace analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadAnalytics}
            disabled={loading}
            variant="secondary"
            className="gap-1.5 shadow-2xs"
          >
            <Icon name="repeat" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => exportTasksToCSV(tasks)}
            className="gap-1.5 shadow-sm"
          >
            <Icon name="download" className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-rose-950 p-4 text-sm font-medium text-red-700 dark:text-rose-300 border border-red-200 dark:border-rose-900 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadAnalytics}
            className="underline font-semibold ml-2 hover:text-red-900 dark:hover:text-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !analytics ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-black dark:border-white border-t-transparent mb-3" />
          <p className="text-sm font-medium">Computing aggregate productivity metrics...</p>
        </div>
      ) : (
        <>
          {/* Primary KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Completion Rate */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-5 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Completion Rate
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-950 dark:text-emerald-100">
                  {completionRate}%
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  ({doneCount}/{totalTasks} tasks)
                </span>
              </div>
              <div className="mt-3 h-2 w-full bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, completionRate)}%` }}
                />
              </div>
            </div>

            {/* 7-Day Velocity */}
            <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-5 shadow-xs">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                7-Day Velocity
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-950 dark:text-blue-100">
                  {thisWeekVelocity}
                </span>
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">completed this wk</span>
              </div>
              <p className="mt-3 text-xs font-medium text-blue-700 dark:text-blue-300">
                {velocityDiff >= 0 ? `+${velocityDiff}` : velocityDiff} vs previous week ({lastWeekVelocity})
              </p>
            </div>

            {/* Overdue Alerts */}
            <div className={`rounded-2xl border p-5 shadow-xs ${
              overdueCount > 0
                ? "border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950"
                : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            }`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${
                overdueCount > 0 ? "text-rose-800 dark:text-rose-300" : "text-gray-600 dark:text-zinc-300"
              }`}>
                Overdue Tasks
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-3xl font-black ${
                  overdueCount > 0 ? "text-rose-700 dark:text-rose-300" : "text-gray-900 dark:text-white"
                }`}>
                  {overdueCount}
                </span>
                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">requiring action</span>
              </div>
              <p className="mt-3 text-xs font-medium text-gray-500 dark:text-zinc-400">
                {overdueCount > 0 ? "Passes scheduled due date" : "All deadlines on schedule"}
              </p>
            </div>

            {/* Checklist Velocity */}
            <div className="rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 p-5 shadow-xs">
              <span className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                Checklist Velocity
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-purple-950 dark:text-purple-100">
                  {subtasksRate}%
                </span>
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                  ({subtasksDone}/{subtasksTotal} subtasks)
                </span>
              </div>
              <div className="mt-3 h-2 w-full bg-purple-200 dark:bg-purple-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, subtasksRate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Status & Priority Distributions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Status Distribution
                </h3>
                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                  {totalTasks} total
                </span>
              </div>

              <div className="space-y-4">
                {/* Done */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-zinc-200 mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Done
                    </span>
                    <span>
                      {doneCount} ({totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${totalTasks ? (doneCount / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* In Progress */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-zinc-200 mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      In Progress
                    </span>
                    <span>
                      {inProgressCount} ({totalTasks ? Math.round((inProgressCount / totalTasks) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${totalTasks ? (inProgressCount / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* To Do */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-zinc-200 mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                      To Do
                    </span>
                    <span>
                      {todoCount} ({totalTasks ? Math.round((todoCount / totalTasks) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full transition-all duration-500"
                      style={{ width: `${totalTasks ? (todoCount / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Priority Breakdown
                </h3>
                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                  {totalTasks} total
                </span>
              </div>

              <div className="space-y-4">
                {/* High */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-zinc-200 mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      High Priority
                    </span>
                    <span>
                      {highPriority} ({totalTasks ? Math.round((highPriority / totalTasks) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${totalTasks ? (highPriority / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-zinc-200 mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                      Medium Priority
                    </span>
                    <span>
                      {medPriority} ({totalTasks ? Math.round((medPriority / totalTasks) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${totalTasks ? (medPriority / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Low */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-zinc-200 mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Low Priority
                    </span>
                    <span>
                      {lowPriority} ({totalTasks ? Math.round((lowPriority / totalTasks) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${totalTasks ? (lowPriority / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Data Export Center */}
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Icon name="download" className="h-5 w-5 text-gray-700 dark:text-zinc-300" />
                  Task Data Export & Backup Center
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-300 mt-1">
                  Export all active workspace tasks ({tasks.length} total tasks) to universal spreadsheet or structured JSON format.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => exportTasksToCSV(tasks)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-100 shadow-2xs hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
                >
                  <Icon name="download" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Export CSV (.csv)</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportTasksToJSON(tasks)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-100 shadow-2xs hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
                >
                  <Icon name="download" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Export JSON (.json)</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
