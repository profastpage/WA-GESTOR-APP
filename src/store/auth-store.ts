import { create } from "zustand";

interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    approved: boolean;
    isPro: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("wa_session", JSON.stringify(data.user));
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      return { success: false, error: data.error || "Error al iniciar sesión" };
    } catch {
      return { success: false, error: "Error de conexión" };
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("wa_session", JSON.stringify(data.user));
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      return { success: false, error: data.error || "Error al registrarse" };
    } catch {
      return { success: false, error: "Error de conexión" };
    }
  },

  logout: () => {
    localStorage.removeItem("wa_session");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkSession: async () => {
    try {
      const stored = localStorage.getItem("wa_session");
      if (stored) {
        const user = JSON.parse(stored);
        // Verify session is still valid with backend
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, password: "__check__" }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } else {
          localStorage.removeItem("wa_session");
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      // Try using stored session as fallback
      const stored = localStorage.getItem("wa_session");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },
}));
