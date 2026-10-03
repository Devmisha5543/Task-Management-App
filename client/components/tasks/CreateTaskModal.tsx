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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
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
    };

    try {
      await createTask(taskData);
      // Reset form
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setDueDate("");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Landing Page"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this task..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "todo" | "in-progress" | "done")
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none bg-white"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Labels <span className="text-xs text-gray-500">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              placeholder="frontend, bug, feature"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* Subtasks / Checklist Builder */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Checklist / Subtasks{" "}
              {subtasks.length > 0 && (
                <span className="text-xs font-normal text-gray-500">
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
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
              >
                + Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/70 p-2">
                {subtasks.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs rounded bg-white px-2.5 py-1.5 shadow-2xs border border-gray-100"
                  >
                    <span className="flex items-center gap-2 text-gray-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {item.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(index)}
                      className="text-gray-400 hover:text-red-500 transition"
                      title="Remove subtask"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
