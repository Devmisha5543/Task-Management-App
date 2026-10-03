"use client";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  viewMode: "grid" | "kanban" | "calendar";
  onViewModeChange: (mode: "grid" | "kanban" | "calendar") => void;
}

export default function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
}: TaskFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative flex-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks by title or description..."
          className="w-full rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
          className="rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="due-soon">Due Date: Soonest</option>
          <option value="due-late">Due Date: Furthest</option>
          <option value="priority-desc">Priority: High to Low</option>
          <option value="title-asc">Title: A-Z</option>
        </select>

        <div className="flex items-center rounded-xl border border-gray-300 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 p-1">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              viewMode === "grid"
                ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-2xs font-bold"
                : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            ⊞ Grid
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("kanban")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              viewMode === "kanban"
                ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-2xs font-bold"
                : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            ▥ Kanban
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("calendar")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              viewMode === "calendar"
                ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-2xs font-bold"
                : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            ▦ Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
