import { create } from "zustand";
import { userApi } from "@/services/instances";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; 

  setAuth: (user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // call this right after a successful login/register response
  setAuth: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  // call this after any profile update (e.g. edit name/phone)
  setUser: (user) => set({ user }),

  logout: () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
    userApi.post("/auth/logout").catch(() => {
      // ignore — we clear local state regardless of backend result
    });
  },

  // called once on app boot (see AuthProvider). Since the access_token lives
  // in an httpOnly cookie, JS can't check "is there a token" directly — the
  // only way to know if the session is still valid is to ask the backend.
  initializeAuth: async () => {
    try {
      const res = await userApi.get("/user/me");
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      // no valid cookie / session expired -> just means logged out
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
