"use client";

import { useRouter, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { useAuthStore } from "@/store/authStore";
import Icon from "@/components/ui/Icon";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.replace("/login?logout=success");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <ProtectedRoute>
      <ToastProvider>
        <div className="min-h-screen bg-gray-100 text-gray-900">
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="hidden w-64 border-r bg-white md:block">
              <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  Task Manager
                </h1>
              </div>

              <nav className="px-4 space-y-1">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    pathname === "/dashboard"
                      ? "bg-black text-white font-semibold shadow-xs"
                      : "text-gray-700 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <Icon name="grid" className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/dashboard/tasks"
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    pathname === "/dashboard/tasks"
                      ? "bg-black text-white font-semibold shadow-xs"
                      : "text-gray-700 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <Icon name="clipboard" className="h-4 w-4" />
                  <span>My Tasks</span>
                </Link>

                <Link
                  href="/dashboard/shared"
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    pathname === "/dashboard/shared"
                      ? "bg-black text-white font-semibold shadow-xs"
                      : "text-gray-700 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <Icon name="users" className="h-4 w-4" />
                  <span>Shared Tasks</span>
                </Link>

                <Link
                  href="/dashboard/calendar"
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    pathname === "/dashboard/calendar"
                      ? "bg-black text-white font-semibold shadow-xs"
                      : "text-gray-700 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <Icon name="calendar" className="h-4 w-4" />
                  <span>Calendar & Timeline</span>
                </Link>

                <Link
                  href="/dashboard/profile"
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    pathname === "/dashboard/profile"
                      ? "bg-black text-white font-semibold shadow-xs"
                      : "text-gray-700 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <Icon name="user" className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </nav>
            </aside>

            {/* Main area */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Header */}
              <header className="flex h-16 items-center justify-between border-b bg-white px-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Workspace
                </h2>

                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 rounded-lg p-1 hover:bg-gray-50 transition"
                  >
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold shadow-xs">
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

                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.username || "User"}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </Link>

                  <Button onClick={handleLogout}>Logout</Button>
                </div>
              </header>

              {/* Page content */}
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </div>
      </ToastProvider>
    </ProtectedRoute>
  );
}