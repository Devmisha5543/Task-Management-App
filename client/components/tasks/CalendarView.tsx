"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import {
  CalendarDay,
  formatDateToKey,
  getCalendarMonthDays,
  getMonthYearHeader,
  getWeekDays,
  isTaskOverdue,
} from "@/lib/dateUtils";
import { useTaskStore } from "@/store/taskStore";
import type { Task } from "@/types/task";

interface CalendarViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onCreateForDate?: (dateString: string) => void;
  onAttachments?: (task: Task) => void;
  onComments?: (task: Task) => void;
  onActivity?: (task: Task) => void;
}

export default function CalendarView({
  tasks,
  onEdit,
  onCreateForDate,
  onAttachments,
  onComments,
  onActivity,
}: CalendarViewProps) {
  const updateTask = useTaskStore((state) => state.updateTask);

  const [activeDate, setActiveDate] = useState<Date>(() => new Date());
  const [viewType, setViewType] = useState<"month" | "week">("month");
  const [isUnscheduledOpen, setIsUnscheduledOpen] = useState(false);
  const [selectedDayModal, setSelectedDayModal] = useState<CalendarDay | null>(null);
  const [schedulingTaskId, setSchedulingTaskId] = useState<string | null>(null);
  const [targetScheduleDate, setTargetScheduleDate] = useState<string>("");

  const handlePrev = () => {
    setActiveDate((prev) => {
      const copy = new Date(prev);
      if (viewType === "month") {
        copy.setMonth(copy.getMonth() - 1);
      } else {
        copy.setDate(copy.getDate() - 7);
      }
      return copy;
    });
  };

  const handleNext = () => {
    setActiveDate((prev) => {
      const copy = new Date(prev);
      if (viewType === "month") {
        copy.setMonth(copy.getMonth() + 1);
      } else {
        copy.setDate(copy.getDate() + 7);
      }
      return copy;
    });
  };

  const handleToday = () => {
    setActiveDate(new Date());
  };

  const { tasksByDate, unscheduledTasks, overdueCount } = useMemo(() => {
    const map: Record<string, Task[]> = {};
    const unscheduled: Task[] = [];
    let overdue = 0;

    tasks.forEach((task) => {
      if (isTaskOverdue(task.dueDate, task.status)) {
        overdue += 1;
      }

      if (!task.dueDate) {
        unscheduled.push(task);
        return;
      }

      try {
        const d = new Date(task.dueDate);
        if (isNaN(d.getTime())) {
          unscheduled.push(task);
          return;
        }
        const key = formatDateToKey(d);
        if (!map[key]) {
          map[key] = [];
        }
        map[key].push(task);
      } catch {
        unscheduled.push(task);
      }
    });

    return { tasksByDate: map, unscheduledTasks: unscheduled, overdueCount: overdue };
  }, [tasks]);

  const monthDays = useMemo(() => getCalendarMonthDays(activeDate), [activeDate]);
  const weekDays = useMemo(() => getWeekDays(activeDate), [activeDate]);

  const handleToggleComplete = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const newStatus = task.status === "done" ? "todo" : "done";
    try {
      await updateTask(task._id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate,
        labels: task.labels,
      });
    } catch (err) {
      console.error("Failed to toggle task status", err);
    }
  };

  const handleAssignDueDate = async (taskId: string, dateStr: string) => {
    const task = tasks.find((t) => t._id === taskId);
    try {
      await updateTask(taskId, {
        title: task?.title || "",
        description: task?.description,
        status: task?.status || "todo",
        priority: task?.priority || "medium",
        labels: task?.labels || [],
        dueDate: new Date(dateStr).toISOString(),
      });
      setSchedulingTaskId(null);
      setTargetScheduleDate("");
    } catch (err) {
      console.error("Failed to assign due date", err);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60";
      case "medium":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60";
      default:
        return "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/60";
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-500";
      case "medium":
        return "bg-amber-500";
      default:
        return "bg-sky-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-1">
            <button
              type="button"
              onClick={handlePrev}
              className="rounded-lg p-1.5 text-gray-600 dark:text-zinc-300 transition hover:bg-white dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white hover:shadow-2xs"
              title="Previous"
            >
              <Icon name="chevron-left" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-zinc-200 transition hover:bg-white dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white hover:shadow-2xs rounded-lg"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg p-1.5 text-gray-600 dark:text-zinc-300 transition hover:bg-white dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white hover:shadow-2xs"
              title="Next"
            >
              <Icon name="chevron-right" className="h-4 w-4" />
            </button>
          </div>

          <h2 className="ml-2 text-lg font-bold text-gray-900 dark:text-zinc-100">
            {viewType === "month"
              ? getMonthYearHeader(activeDate)
              : `Week of ${weekDays[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDays[6].date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <Icon name="alert-circle" className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              <span>{overdueCount} Overdue</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsUnscheduledOpen(!isUnscheduledOpen)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              isUnscheduledOpen
                ? "border-black dark:border-zinc-600 bg-black dark:bg-zinc-100 text-white dark:text-zinc-900"
                : "border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
            }`}
          >
            <Icon name="clock" className="h-3.5 w-3.5" />
            <span>Unscheduled</span>
            {unscheduledTasks.length > 0 && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                  isUnscheduledOpen
                    ? "bg-white text-black font-bold dark:bg-zinc-900 dark:text-white"
                    : "bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-200"
                }`}
              >
                {unscheduledTasks.length}
              </span>
            )}
          </button>

          <div className="flex rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 p-1">
            <button
              type="button"
              onClick={() => setViewType("month")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                viewType === "month"
                  ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 shadow-2xs font-bold"
                  : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Month
            </button>

            <button
              type="button"
              onClick={() => setViewType("week")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                viewType === "week"
                  ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 shadow-2xs font-bold"
                  : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          {viewType === "month" ? (
            <div className="flex flex-col">
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/60 text-center text-xs font-semibold text-gray-600 dark:text-zinc-400">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                  <div
                    key={day}
                    className={`py-3 ${idx === 0 || idx === 6 ? "text-gray-400 dark:text-zinc-500" : ""}`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100 dark:divide-zinc-800/80">
                {monthDays.map((day) => {
                  const dayTasks = tasksByDate[day.dateString] || [];
                  const visibleTasks = dayTasks.slice(0, 3);
                  const overflowCount = dayTasks.length - visibleTasks.length;
                  const dayHasOverdue = day.isPast && dayTasks.some((t) => t.status !== "done");

                  return (
                    <div
                      key={day.dateString}
                      onClick={() => {
                        if (onCreateForDate && dayTasks.length === 0) {
                          onCreateForDate(day.dateString);
                        }
                      }}
                      className={`group relative flex min-h-[110px] flex-col p-1.5 transition-colors sm:min-h-[125px] sm:p-2 ${
                        day.isCurrentMonth
                          ? day.isToday
                            ? "bg-blue-50/30 dark:bg-blue-950/20"
                            : "bg-white dark:bg-zinc-900 hover:bg-gray-50/60 dark:hover:bg-zinc-800/50"
                          : "bg-gray-50/40 dark:bg-zinc-950/50 text-gray-400 dark:text-zinc-600"
                      }`}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition ${
                            day.isToday
                              ? "bg-black dark:bg-white text-white dark:text-black font-bold shadow-xs"
                              : dayHasOverdue
                              ? "text-rose-600 dark:text-rose-400 font-bold"
                              : day.isCurrentMonth
                              ? "text-gray-900 dark:text-zinc-200"
                              : "text-gray-400 dark:text-zinc-600"
                          }`}
                        >
                          {day.dayNumber}
                        </span>

                        {onCreateForDate && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateForDate(day.dateString);
                            }}
                            className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-gray-400 dark:text-zinc-500 transition hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white"
                            title={`Create task for ${day.dateString}`}
                          >
                            <Icon name="plus" className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                        {visibleTasks.map((task) => {
                          const isDone = task.status === "done";
                          const isOverdue = isTaskOverdue(task.dueDate, task.status);

                          return (
                            <div
                              key={task._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task);
                              }}
                              className={`group/chip flex cursor-pointer items-center justify-between gap-1 rounded-lg border px-1.5 py-0.5 text-xs transition hover:shadow-2xs ${
                                isDone
                                  ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 line-through opacity-75"
                                  : isOverdue
                                  ? "border-rose-300 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300"
                                  : getPriorityBadgeClass(task.priority)
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-1.5">
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                    isDone ? "bg-emerald-500" : getPriorityDot(task.priority)
                                  }`}
                                />
                                <span className="truncate font-medium text-[11px] leading-tight">
                                  {task.title}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => handleToggleComplete(e, task)}
                                className={`shrink-0 rounded p-0.5 opacity-0 transition group-hover/chip:opacity-100 ${
                                  isDone
                                    ? "text-emerald-700 dark:text-emerald-400 hover:text-emerald-900"
                                    : "text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white"
                                }`}
                                title={isDone ? "Mark Incomplete" : "Mark Complete"}
                              >
                                <Icon name="check" className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          );
                        })}

                        {overflowCount > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayModal(day);
                            }}
                            className="mt-auto self-start text-[10px] font-semibold text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:underline"
                          >
                            +{overflowCount} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-zinc-800 sm:grid-cols-7 sm:divide-x sm:divide-y-0">
                {weekDays.map((day) => {
                  const dayTasks = tasksByDate[day.dateString] || [];

                  return (
                    <div
                      key={day.dateString}
                      className={`flex min-h-[420px] flex-col p-3 transition-colors ${
                        day.isToday ? "bg-blue-50/20 dark:bg-blue-950/20" : "bg-white dark:bg-zinc-900 hover:bg-gray-50/30 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                            {day.date.toLocaleDateString("en-US", { weekday: "short" })}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                day.isToday
                                  ? "bg-black dark:bg-white text-white dark:text-black"
                                  : "text-gray-900 dark:text-zinc-200"
                              }`}
                            >
                              {day.dayNumber}
                            </span>
                            {dayTasks.length > 0 && (
                              <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-400">
                                ({dayTasks.length})
                              </span>
                            )}
                          </div>
                        </div>

                        {onCreateForDate && (
                          <button
                            type="button"
                            onClick={() => onCreateForDate(day.dateString)}
                            className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1 text-gray-500 dark:text-zinc-400 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white transition"
                            title={`Add task for ${day.dateString}`}
                          >
                            <Icon name="plus" className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col gap-2">
                        {dayTasks.length === 0 ? (
                          <div className="flex flex-1 items-center justify-center text-center text-xs text-gray-400 dark:text-zinc-500">
                            No tasks scheduled
                          </div>
                        ) : (
                          dayTasks.map((task) => {
                            const isDone = task.status === "done";
                            const isOverdue = isTaskOverdue(task.dueDate, task.status);

                            return (
                              <div
                                key={task._id}
                                onClick={() => onEdit(task)}
                                className={`cursor-pointer rounded-xl border p-2.5 shadow-2xs transition hover:shadow-sm ${
                                  isDone
                                    ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30"
                                    : isOverdue
                                    ? "border-rose-200 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/30"
                                    : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:border-gray-300 dark:hover:border-zinc-700"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1.5">
                                  <h4
                                    className={`text-xs font-semibold leading-snug ${
                                      isDone ? "line-through text-gray-500 dark:text-zinc-500" : "text-gray-900 dark:text-zinc-100"
                                    }`}
                                  >
                                    {task.title}
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleComplete(e, task)}
                                    className={`shrink-0 rounded p-1 transition ${
                                      isDone
                                        ? "text-emerald-600 dark:text-emerald-400 hover:text-emerald-800"
                                        : "text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white"
                                    }`}
                                  >
                                    <Icon name={isDone ? "check-circle" : "check"} className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                {task.description && (
                                  <p className="mt-1 line-clamp-2 text-[11px] text-gray-500 dark:text-zinc-400">
                                    {task.description}
                                  </p>
                                )}

                                <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 dark:border-zinc-750 pt-1.5 text-[10px]">
                                  <span
                                    className={`rounded-md px-1.5 py-0.5 font-semibold uppercase ${
                                      task.priority === "high"
                                        ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300"
                                        : task.priority === "medium"
                                        ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                                        : "bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>

                                  {task.subtasks && task.subtasks.length > 0 && (
                                    <span className="text-gray-400 dark:text-zinc-500">
                                      {task.subtasks.filter((s) => s.completed).length}/
                                      {task.subtasks.length} subtasks
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {isUnscheduledOpen && (
          <div className="flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs lg:w-72">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 p-4">
              <div className="flex items-center gap-2">
                <Icon name="clock" className="h-4 w-4 text-gray-700 dark:text-zinc-300" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">Unscheduled Tasks</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUnscheduledOpen(false)}
                className="rounded-lg p-1 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 text-xs text-gray-500 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40">
              Tasks without due dates. Pick a date to schedule them directly into the calendar.
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3 max-h-[500px]">
              {unscheduledTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 dark:text-zinc-500">
                  All tasks are scheduled!
                </div>
              ) : (
                unscheduledTasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/70 p-2.5 shadow-2xs hover:border-gray-300 dark:hover:border-zinc-700 transition"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h4
                        onClick={() => onEdit(task)}
                        className="cursor-pointer text-xs font-semibold text-gray-900 dark:text-zinc-100 hover:underline"
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                          task.priority === "high"
                            ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300"
                            : task.priority === "medium"
                            ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                            : "bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {schedulingTaskId === task._id ? (
                      <div className="mt-2.5 flex items-center gap-1.5 border-t border-gray-100 dark:border-zinc-700 pt-2">
                        <input
                          type="date"
                          value={targetScheduleDate}
                          onChange={(e) => setTargetScheduleDate(e.target.value)}
                          className="flex-1 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          disabled={!targetScheduleDate}
                          onClick={() => handleAssignDueDate(task._id, targetScheduleDate)}
                          className="rounded-lg bg-black dark:bg-white px-2.5 py-1 text-xs font-semibold text-white dark:text-black disabled:opacity-40"
                        >
                          Set
                        </button>
                        <button
                          type="button"
                          onClick={() => setSchedulingTaskId(null)}
                          className="rounded-lg border border-gray-200 dark:border-zinc-700 px-1.5 py-1 text-xs text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center justify-between border-t border-gray-100 dark:border-zinc-700/60 pt-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleAssignDueDate(task._id, formatDateToKey(new Date()))
                          }
                          className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Schedule Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSchedulingTaskId(task._id);
                            setTargetScheduleDate(formatDateToKey(new Date()));
                          }}
                          className="rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
                        >
                          Pick Date
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {selectedDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                  Tasks for{" "}
                  {selectedDayModal.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  {(tasksByDate[selectedDayModal.dateString] || []).length} scheduled task(s)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayModal(null)}
                className="rounded-lg p-1 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
              {(tasksByDate[selectedDayModal.dateString] || []).map((task) => (
                <div
                  key={task._id}
                  onClick={() => {
                    setSelectedDayModal(null);
                    onEdit(task);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 p-3 transition hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        task.status === "done"
                          ? "bg-emerald-500"
                          : getPriorityDot(task.priority)
                      }`}
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          task.status === "done"
                            ? "text-gray-500 dark:text-zinc-500 line-through"
                            : "text-gray-900 dark:text-zinc-100"
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 capitalize">
                        Status: {task.status.replace("-", " ")}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      task.priority === "high"
                        ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300"
                        : task.priority === "medium"
                        ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                        : "bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-gray-100 dark:border-zinc-800 pt-3">
              {onCreateForDate && (
                <button
                  type="button"
                  onClick={() => {
                    const dateKey = selectedDayModal.dateString;
                    setSelectedDayModal(null);
                    onCreateForDate(dateKey);
                  }}
                  className="rounded-xl bg-black dark:bg-white px-3.5 py-1.5 text-xs font-semibold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-zinc-200 transition"
                >
                  + Add Task for This Day
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedDayModal(null)}
                className="rounded-xl border border-gray-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
