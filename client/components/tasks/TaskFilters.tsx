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
  viewMode: "grid" | "kanban";
  onViewModeChange: (mode: "grid" | "kanban") => void;
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
      {/* Search Bar */}
      <div className="relative flex-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks by title or description..."
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Selectors, Sort, & View Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        {/* Sort By Selector */}
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority-desc">Priority: High to Low</option>
          <option value="title-asc">Title: A-Z</option>
        </select>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center rounded-xl border border-gray-300 bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              viewMode === "grid"
                ? "bg-white text-black shadow-2xs"
                : "text-gray-500 hover:text-black"
            }`}
          >
            ⊞ Grid
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("kanban")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              viewMode === "kanban"
                ? "bg-white text-black shadow-2xs"
                : "text-gray-500 hover:text-black"
            }`}
          >
            📋 Kanban
          </button>
        </div>
      </div>
    </div>
  );
}
