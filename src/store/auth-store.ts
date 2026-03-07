import { create } from "zustand";

export type UserRole = "admin" | "juriste";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  /** Appel API /api/auth/me et met à jour user. Retourne true si connecté. */
  hydrate: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
  isAuthenticated: () => !!get().user,
  hydrate: async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        set({ user: null });
        return false;
      }
      const data = await res.json();
      set({ user: data.user ?? null });
      return !!data.user;
    } catch {
      set({ user: null });
      return false;
    }
  },
}));
