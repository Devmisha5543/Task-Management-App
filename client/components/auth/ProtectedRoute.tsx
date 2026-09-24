"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      if (!user) {
        // Restore from localStorage first for instant UI response
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            useAuthStore.setState({ user: parsedUser, token, isAuthenticated: true });
          } catch (e) {
            console.error("Failed to parse stored user", e);
          }
        }

        // Verify/fetch latest user info from backend API
        await fetchCurrentUser();
      }

      setChecking(false);
    };

    initAuth();
  }, [router, user, fetchCurrentUser]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
          Authenticating...
        </div>
      </div>
    );
  }

  return children;
}