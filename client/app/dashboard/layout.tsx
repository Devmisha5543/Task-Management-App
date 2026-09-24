"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import { ToastProvider } from "@/components/ui/ToastProvider";
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
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-black transition"
                >
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/tasks"
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-black transition"
                >
                  My Tasks
                </Link>

                <Link
                  href="/dashboard/shared"
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-black transition"
                >
                  Shared Tasks
                </Link>

                <Link
                  href="/dashboard/profile"
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-black transition"
                >
                  Profile
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

                <div className="flex items-center gap-4">
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