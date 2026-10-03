import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-black text-white hover:bg-zinc-800 shadow-xs border border-transparent dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 dark:border-zinc-200 dark:shadow-md focus:ring-black dark:focus:ring-white dark:focus:ring-offset-zinc-950",
    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:border-zinc-700 focus:ring-gray-400 dark:focus:ring-zinc-600",
    outline:
      "bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-300 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:border-zinc-700 focus:ring-gray-400",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80 focus:ring-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 shadow-xs focus:ring-red-500",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}