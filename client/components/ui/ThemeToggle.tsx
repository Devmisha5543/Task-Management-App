"use client";

import React from "react";
import Icon from "./Icon";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition shadow-2xs ${
        showLabel ? "px-3 py-2 text-xs font-semibold" : "h-9 w-9"
      } ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Icon name="sun" className="h-4 w-4 text-amber-400 animate-in spin-in-180 duration-200" />
        ) : (
          <Icon name="moon" className="h-4 w-4 text-indigo-600 animate-in spin-in-180 duration-200" />
        )}
      </div>
      {showLabel && (
        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
      )}
    </button>
  );
}
