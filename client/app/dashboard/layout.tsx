"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { useAuthStore } from "@/store/authStore";
import Icon from "@/components/ui/Icon";
import NotificationBell from "@/components/notifications/NotificationBell";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const router = useRouter();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("taskflow_sidebar_collapsed");
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem("taskflow_sidebar_collapsed", String(next));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login?logout=success");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "grid" as const },
    { href: "/dashboard/tasks", label: "My Tasks", icon: "clipboard" as const },
    { href: "/dashboard/shared", label: "Shared Tasks", icon: "users" as const },
    { href: "/dashboard/calendar", label: "Calendar & Timeline", icon: "calendar" as const },
    { href: "/dashboard/analytics", label: "Analytics", icon: "chart" as const },
    { href: "/dashboard/mobile", label: "Mobile App", icon: "smartphone" as const },
    { href: "/dashboard/profile", label: "Profile", icon: "user" as const },
    { href: "/dashboard/settings", label: "Settings", icon: "settings" as const },
  ];

  return (
    <ProtectedRoute>
      <ToastProvider>
        <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-200">
          <div className="flex min-h-screen">
            {/* Mobile Drawer Backdrop */}
            {isMobileOpen && (
              <div
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
              />
            )}

            {/* Desktop & Mobile Collapsible Sidebar */}
            <aside
              className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800/80 transition-all duration-300 ease-in-out md:static ${
                isMobileOpen
                  ? "translate-x-0 w-64 shadow-2xl"
                  : "-translate-x-full md:translate-x-0"
              } ${isCollapsed ? "md:w-20" : "md:w-64"}`}
            >
              {/* Sidebar Header */}
              <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 dark:border-zinc-800/80">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2.5 overflow-hidden transition-all ${
                    isCollapsed ? "justify-center w-full" : ""
                  }`}
                  title="TaskFlow"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-sm shadow-xs">
                    TF
                  </div>
                  {!isCollapsed && (
                    <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white truncate">
                      TaskFlow
                    </span>
                  )}
                </Link>

                {/* Sidebar Collapse Toggle Button (Desktop) */}
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className={`hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition ${
                    isCollapsed ? "hidden" : ""
                  }`}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <Icon name="chevron-left" className="h-4 w-4" />
                </button>

                {/* Close Button (Mobile) */}
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="md:hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={`group relative flex items-center rounded-xl py-2.5 transition text-sm font-medium ${
                        isCollapsed ? "justify-center px-0" : "gap-3 px-3.5"
                      } ${
                        isActive
                          ? "bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                          : "text-gray-700 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/80 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <Icon
                        name={item.icon}
                        className={`h-4 w-4 shrink-0 ${
                          isActive
                            ? "text-white dark:text-black"
                            : "text-gray-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}

                      {/* Tooltip for collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 hidden rounded-md bg-gray-900 dark:bg-zinc-800 px-2 py-1 text-xs font-semibold text-white shadow-md group-hover:block z-50 whitespace-nowrap">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Sidebar Footer with Expand Toggle when collapsed */}
              {isCollapsed && (
                <div className="hidden md:flex p-3 border-t border-gray-100 dark:border-zinc-800/80 justify-center">
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                    title="Expand sidebar"
                    aria-label="Expand sidebar"
                  >
                    <Icon name="chevron-right" className="h-4 w-4" />
                  </button>
                </div>
              )}
            </aside>

            {/* Main Area */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Top Header */}
              <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-gray-200 dark:border-zinc-800/80 px-4 sm:px-6 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Mobile Menu Hamburger */}
                  <button
                    type="button"
                    onClick={() => setIsMobileOpen(true)}
                    className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    aria-label="Open sidebar menu"
                  >
                    <Icon name="list" className="h-4 w-4" />
                  </button>

                  {/* Desktop Sidebar Collapse Toggle Shortcut */}
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                    title={isCollapsed ? "Expand sidebar (w-64)" : "Collapse sidebar (w-20)"}
                    aria-label="Toggle sidebar"
                  >
                    <Icon name="sidebar" className="h-4 w-4" />
                  </button>

                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                    Workspace
                  </h2>
                </div>

                {/* Right Action Icons: Dark Mode Toggle, Notification Bell, User Profile, Logout */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Dark Mode Switcher */}
                  <ThemeToggle />

                  {/* Notifications Center */}
                  <NotificationBell />

                  {/* User Profile Shortcut */}
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2.5 rounded-xl p-1 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                  >
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-black text-xs font-bold shadow-xs">
                      {user?.profilePhoto ? (
                        <Image
                          src={user.profilePhoto}
                          alt={user.username || "User"}
                          width={36}
                          height={36}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span>{getInitials(user?.username)}</span>
                      )}
                    </div>

                    <div className="hidden text-left lg:block">
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                        {user?.username || "User"}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate max-w-[120px]">
                        {user?.email}
                      </p>
                    </div>
                  </Link>

                  <Button
                    onClick={handleLogout}
                    variant="secondary"
                    className="text-xs py-1.5 px-3 rounded-xl"
                  >
                    Logout
                  </Button>
                </div>
              </header>

              {/* Page Content */}
              <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
          </div>
        </div>
      </ToastProvider>
    </ProtectedRoute>
  );
}