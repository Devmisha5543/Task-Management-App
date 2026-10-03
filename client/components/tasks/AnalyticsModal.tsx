"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { getTaskAnalytics, exportTasksToCSV, exportTasksToJSON } from "@/lib/analyticsApi";
import type { Task, TaskAnalytics } from "@/types/task";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export default function AnalyticsModal({
  isOpen,
  onClose,
  tasks,
}: AnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white shadow-xs">
              <Icon name="chart" className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Productivity & Analytics Hub
              </h2>
              <p className="text-xs text-gray-500">
                Live performance metrics, velocity insights, and raw data exports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200/60 hover:text-gray-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={loadAnalytics}
                className="underline font-semibold ml-2 hover:text-red-900"
              >
                Retry
              </button>
            </div>
          )}

          {loading && !analytics ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-black border-t-transparent mb-3"></span>
              Computing aggregate productivity analytics...
            </div>
          ) : (
            <>
              {/* Primary KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {/* Completion Rate */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                    Completion Rate
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-950">
                      {completionRate}%
                    </span>
                    <span className="text-xs text-emerald-700 font-medium">
                      ({doneCount}/{totalTasks})
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-emerald-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, completionRate)}%` }}
                    />
                  </div>
                </div>

                {/* 7-Day Velocity */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
                    7-Day Velocity
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-blue-950">
                      {thisWeekVelocity}
                    </span>
                    <span className="text-xs text-blue-700">done this wk</span>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-blue-700">
                    {velocityDiff >= 0 ? `+${velocityDiff}` : velocityDiff} vs previous week ({lastWeekVelocity})
                  </p>
                </div>

                {/* Overdue Alerts */}
                <div className={`rounded-xl border p-4 ${
                  overdueCount > 0
                    ? "border-rose-200 bg-rose-50/60"
                    : "border-gray-100 bg-gray-50/70"
                }`}>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                    overdueCount > 0 ? "text-rose-800" : "text-gray-500"
                  }`}>
                    Overdue Tasks
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${
                      overdueCount > 0 ? "text-rose-700" : "text-gray-900"
                    }`}>
                      {overdueCount}
                    </span>
                    <span className="text-xs text-gray-500">requiring action</span>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    {overdueCount > 0 ? "Passes scheduled due date" : "All deadlines on schedule"}
                  </p>
                </div>

                {/* Subtasks Completion */}
                <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                  <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider">
                    Checklist Velocity
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-purple-950">
                      {subtasksRate}%
                    </span>
                    <span className="text-xs text-purple-700">
                      ({subtasksDone}/{subtasksTotal})
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-purple-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, subtasksRate)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status and Priority Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Breakdown Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Status Distribution
                  </h3>
                  <div className="space-y-2.5">
                    {/* Done */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Done
                        </span>
                        <span>
                          {doneCount} ({totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${totalTasks ? (doneCount / totalTasks) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* In Progress */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          In Progress
                        </span>
                        <span>
                          {inProgressCount} ({totalTasks ? Math.round((inProgressCount / totalTasks) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${totalTasks ? (inProgressCount / totalTasks) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* To Do */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          To Do
                        </span>
                        <span>
                          {todoCount} ({totalTasks ? Math.round((todoCount / totalTasks) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 rounded-full"
                          style={{ width: `${totalTasks ? (todoCount / totalTasks) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority Breakdown Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Priority Breakdown
                  </h3>
                  <div className="space-y-2.5">
                    {/* High */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          High Priority
                        </span>
                        <span>
                          {highPriority} ({totalTasks ? Math.round((highPriority / totalTasks) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${totalTasks ? (highPriority / totalTasks) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Medium */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-orange-500" />
                          Medium Priority
                        </span>
                        <span>
                          {medPriority} ({totalTasks ? Math.round((medPriority / totalTasks) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${totalTasks ? (medPriority / totalTasks) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Low */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Low Priority
                        </span>
                        <span>
                          {lowPriority} ({totalTasks ? Math.round((lowPriority / totalTasks) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${totalTasks ? (lowPriority / totalTasks) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Export Center */}
              <div className="rounded-xl border border-gray-200 bg-linear-to-r from-gray-50 to-slate-50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <Icon name="download" className="h-4 w-4 text-gray-700" />
                      Task Data Export & Backup
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Export your active workspace tasks ({tasks.length} tasks) to universal spreadsheet or backup formats.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => exportTasksToCSV(tasks)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 hover:border-gray-400 transition"
                    >
                      <Icon name="download" className="h-3.5 w-3.5 text-emerald-600" />
                      Export CSV (.csv)
                    </button>

                    <button
                      type="button"
                      onClick={() => exportTasksToJSON(tasks)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 hover:border-gray-400 transition"
                    >
                      <Icon name="download" className="h-3.5 w-3.5 text-blue-600" />
                      Export JSON (.json)
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-6 py-3">
          <button
            type="button"
            onClick={loadAnalytics}
            disabled={loading}
            className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 transition"
          >
            <Icon name="repeat" className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-black px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
