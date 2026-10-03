"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useTaskStore } from "@/store/taskStore";
import type { CreateTaskData } from "@/types/task";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDueDate?: string;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  initialDueDate,
}: CreateTaskModalProps) {
  const createTask = useTaskStore((state) => state.createTask);
  const allTasks = useTaskStore((state) => state.tasks);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [labelsInput, setLabelsInput] = useState("");
  const [subtasks, setSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialDueDate) {
      setDueDate(initialDueDate);
    }
  }, [isOpen, initialDueDate]);

  const handleAddSubtask = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!subtaskInput.trim()) return;
    setSubtasks([...subtasks, { title: subtaskInput.trim(), completed: false }]);
    setSubtaskInput("");
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Task title is required");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const labels = labelsInput
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const taskData: CreateTaskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      labels,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      isRecurring: recurrence !== "none",
      recurrence: recurrence,
      dependencies: selectedDependencies.length > 0 ? selectedDependencies : undefined,
    };

    try {
      await createTask(taskData);
      // Reset form
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setDueDate("");
      setRecurrence("none");
      setSelectedDependencies([]);
      setLabelsInput("");
      setSubtasks([]);
      setSubtaskInput("");
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to create task");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Create New Task</h2>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 p-3 text-sm text-red-600 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Landing Page"
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:border-black dark:focus:border-zinc-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this task..."
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:border-black dark:focus:border-zinc-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "todo" | "in-progress" | "done")
                }
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm focus:border-black dark:focus:border-zinc-500 focus:outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 transition"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm focus:border-black dark:focus:border-zinc-500 focus:outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 transition"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm focus:border-black dark:focus:border-zinc-500 focus:outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Recurrence <span className="text-xs text-gray-400 dark:text-zinc-500 font-normal">(Auto-spawns)</span>
              </label>
              <select
                value={recurrence}
                onChange={(e) =>
                  setRecurrence(e.target.value as "none" | "daily" | "weekly" | "monthly")
                }
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm focus:border-black dark:focus:border-zinc-500 focus:outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 transition"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily (+1 day)</option>
                <option value="weekly">Weekly (+7 days)</option>
                <option value="monthly">Monthly (+1 month)</option>
              </select>
            </div>
          </div>

          {/* Task Dependencies / Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Prerequisites & Dependencies{" "}
              {selectedDependencies.length > 0 && (
                <span className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  ({selectedDependencies.length} selected)
                </span>
              )}
            </label>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-1">
              Prerequisite tasks that must be marked &quot;Done&quot; before this task can be completed.
            </p>
            {allTasks.length === 0 ? (
              <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 p-2.5 text-xs text-gray-400 dark:text-zinc-500 italic">
                No existing tasks to select as prerequisites.
              </div>
            ) : (
              <div className="max-h-28 overflow-y-auto rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 p-2 space-y-1">
                {allTasks.map((t) => {
                  const isChecked = selectedDependencies.includes(t._id);
                  return (
                    <label
                      key={t._id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-white dark:hover:bg-zinc-800 text-xs cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedDependencies(selectedDependencies.filter((id) => id !== t._id));
                          } else {
                            setSelectedDependencies([...selectedDependencies, t._id]);
                          }
                        }}
                        className="rounded border-gray-300 dark:border-zinc-600 text-black dark:text-white focus:ring-black"
                      />
                      <span className="font-medium text-gray-800 dark:text-zinc-200 line-clamp-1 flex-1">
                        {t.title}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                          t.status === "done"
                            ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                            : "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300"
                        }`}
                      >
                        {t.status}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Labels <span className="text-xs text-gray-500 dark:text-zinc-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              placeholder="frontend, bug, feature"
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:border-black dark:focus:border-zinc-500 focus:outline-none transition"
            />
          </div>

          {/* Subtasks / Checklist Builder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Checklist / Subtasks{" "}
              {subtasks.length > 0 && (
                <span className="text-xs font-normal text-gray-500 dark:text-zinc-400">
                  ({subtasks.length} item{subtasks.length !== 1 ? "s" : ""})
                </span>
              )}
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add checklist item & press Enter..."
                className="flex-1 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:border-black dark:focus:border-zinc-500 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="rounded-lg bg-gray-100 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
              >
                + Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40 p-2">
                {subtasks.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs rounded bg-white dark:bg-zinc-800 px-2.5 py-1.5 shadow-2xs border border-gray-100 dark:border-zinc-700"
                  >
                    <span className="flex items-center gap-2 text-gray-700 dark:text-zinc-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {item.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(index)}
                      className="text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-rose-400 transition"
                      title="Remove subtask"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
