import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import api from "../lib/axios"; // Swapped raw fetch for your custom axios instance
import { toast } from "react-hot-toast";

/* ==========================================================================
   1. Types Configuration
   ========================================================================== */
interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  // Add other user properties as needed
}

interface UserStore {
  user: User | null;
  loading: boolean;
  checkingAuth: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  signup: (data: Record<string, unknown>) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

/* ==========================================================================
   2. Environment-Aware Cookie Configuration
   ========================================================================== */
const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";

const COOKIE_CONFIG = {
  // Omit domain on localhost so the browser natively accepts it in dev mode
  ...(isDev ? {} : { domain: ".jobflix.in" }),
  expires: 30, // Keeps UI data active for 30 days
  secure: true,
  sameSite: "Lax" as const,
};

const crossSubdomainCookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return Cookies.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, COOKIE_CONFIG);
  },
  removeItem: (name: string): void => {
    // Must explicitly match the domain options block to delete properly
    Cookies.remove(name, { domain: COOKIE_CONFIG.domain });
  },
};

/* ==========================================================================
   3. Persisted Store Implementation
   ========================================================================== */
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      checkingAuth: false,

      setUser: (user) => set({ user }),

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      login: async (email, password) => {
        set({ loading: true });
        try {
          const response = await api.post("/user/login", { email, password });
          const data = response.data;

          // Hydrates state, which triggers an automatic write to your shared cookie
          set({ user: data });
          return { success: true };
        } catch (error: any) {
          const errMsg = error.response?.data?.message || "Login failed";
          toast.error(errMsg);
          return { success: false };
        } finally {
          set({ loading: false });
        }
      },

      signup: async (payload) => {
        set({ loading: true });
        try {
          const response = await api.post("/user/create", payload);
          const data = response.data;

          // Hydrates state and syncing the data to the cookie
          set({ user: data });
          return { success: true };
        } catch (error: any) {
          const errMsg = error.response?.data?.message || "Signup failed";
          toast.error(errMsg);
          return { success: false };
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          // Instantly wipe client side user data and remove the shared cookie
          set({ user: null });

          await api.post("/auth/logout");
        } catch (error: any) {
          const errMsg = error.response?.data?.message || "An error occurred during logout";
          toast.error(errMsg);
        }
      },

      checkAuth: async () => {
        set({ checkingAuth: true });
        try {
          const response = await api.get("/account/profile");
          set({ user: response.data.user });
        } catch {
          set({ user: null });
        } finally {
          set({ checkingAuth: false });
        }
      },
    }),
    {
      name: "jobflix_user_ui", // 👈 Must match exactly across all apps to share the data layer
      storage: createJSONStorage(() => crossSubdomainCookieStorage),

      // ⚠️ Keep the cookie light and fast by separating your UI fields from loading indicators
      partialize: (state) => ({ user: state.user }),
    }
  )
);