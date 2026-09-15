import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
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

            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-600 sm:block">
                Welcome
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                U
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}