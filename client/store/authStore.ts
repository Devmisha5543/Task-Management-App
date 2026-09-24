import { create } from "zustand";
import type { User } from "@/types/auth";
import { apiRequest } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: false,
  loading: false,

  login: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }

    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  fetchCurrentUser: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    set({ loading: true });
    try {
      const data = await apiRequest("/auth/me");
      if (data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        set({
          user: data.user,
          token,
          isAuthenticated: true,
          loading: false,
        });
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      get().logout();
      set({ loading: false });
    }
  },
}));