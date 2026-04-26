import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

interface User {
	id: string;
	username: string;
	email: string;
	// Add other user properties as needed
}

interface UserStore {
	user: User | null;
	loading: boolean;
	checkingAuth: boolean;
	login: (email: string, password: string) => Promise<{ success: boolean }>;
	signup: (data: Record<string, unknown>) => Promise<{ success: boolean }>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
	updateUser: (user: Partial<User>) => void;
}

export const useUserStore = create<UserStore>((set) => ({
	user: null,
	loading: false,
	checkingAuth: true,
	updateUser: (data: Partial<User>) =>
		set((state) => ({
		user: state.user ? { ...state.user, ...data } : null,
	})),

	login: async (email: string, password: string) => {
		set({ loading: true });
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/login`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Login failed");
			set({ user: data, loading: false });
			return { success: true };
		} catch (error: any) {
			set({ loading: false });
			toast.error(error.message || "An error occurred during login");
			return { success: false };
		}
	},

	signup: async (data: Record<string, unknown>) => {
		set({ loading: true });
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/create`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			const resData = await res.json();
			if (!res.ok) throw new Error(resData.message || "Signup failed");
			set({ user: resData, loading: false });
			return { success: true };
		} catch (error: any) {
			set({ loading: false });
			toast.error(error.message || "An error occurred during signup");
			return { success: false };
		}
	},

	logout: async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/logout`, {
				method: "POST",
				credentials: "include", // include cookies if your auth uses them
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			set({user: null});
			window.location.href = data.next;
		} catch (error: any) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/account/profile`, {
				credentials: "include",
			});

			const data = await res.json();
			if (!res.ok) throw new Error();
			set({ user: data.user, checkingAuth: false });
		} catch {
			set({ user: null, checkingAuth: false });
		}
	},
}));