"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      setAuth: (user) => {
        set({ user });
      },

      clearAuth: () => {
        set({ user: null });
      },

      isAdmin: () => get().user?.role === "ADMIN",
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
