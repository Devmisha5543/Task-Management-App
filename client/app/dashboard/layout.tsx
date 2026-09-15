"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";


import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const router = useRouter();

  const handleLogout = () => {
  logout();
  router.replace("/login?logout=success");
};
  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-white md:block">
          <div className="p-6">
            <h1 className="text-xl font-bold">
              Task Manager
            </h1>
          </div>

          <nav className="px-4">
            <a
              href="/dashboard"
              className="block rounded-lg px-4 py-3 hover:bg-gray-100"
            >
              Dashboard
            </a>

            <a
              href="/dashboard/tasks"
              className="block rounded-lg px-4 py-3 hover:bg-gray-100"
            >
              My Tasks
            </a>

            <a
              href="/dashboard/shared"
              className="block rounded-lg px-4 py-3 hover:bg-gray-100"
            >
              Shared Tasks
            </a>
          </nav>
        </aside>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <h2 className="text-lg font-semibold">
              Dashboard
            </h2>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {user?.username || "User"}
                </p>

                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
             </div>

              <Button onClick={handleLogout}>
                Logout
            </Button>
          </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  </ProtectedRoute>
  );
}