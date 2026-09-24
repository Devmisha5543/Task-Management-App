"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

import Icon from "@/components/ui/Icon";

export default function Home() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (token && user) {
      router.push("/dashboard");
    }
  }, [token, user, router]);

  return (
    <main className="flex min-h-screen flex-col justify-between bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Navigation Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/30">
            <Icon name="check" className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-300 transition hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
          Organize & Collaborate Effortlessly
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
          Smart Task Management for Individuals & Teams
        </h1>

        <p className="mt-6 max-w-2xl text-base text-gray-400 sm:text-lg">
          Streamline your workflow with intuitive Kanban boards, priority tracking, task sharing, and real-time synchronization across desktop and mobile devices.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/40 transition hover:bg-blue-500"
          >
            Create Free Account
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-700 bg-gray-800/80 px-8 py-3.5 text-base font-semibold text-gray-200 shadow-sm transition hover:bg-gray-700 hover:text-white"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Quick Feature Grid */}
        <div className="mt-20 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md">
            <div className="mb-3 text-blue-400">
              <Icon name="clipboard" className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-white">Kanban & List Views</h3>
            <p className="mt-2 text-xs text-gray-400">
              Switch seamlessly between interactive Kanban boards and filtered list views.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md">
            <div className="mb-3 text-blue-400">
              <Icon name="cloud-upload" className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-white">Real-Time Sync</h3>
            <p className="mt-2 text-xs text-gray-400">
              Access your tasks anywhere with synchronized mobile and web applications.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md">
            <div className="mb-3 text-blue-400">
              <Icon name="users" className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-white">Team Collaboration</h3>
            <p className="mt-2 text-xs text-gray-400">
              Share task permissions, assign collaborators, and attach files effortlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} TaskFlow Management App. All rights reserved.
      </footer>
    </main>
  );
}