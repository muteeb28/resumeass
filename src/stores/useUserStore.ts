import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

interface User {
	id: string;
	username: string;
	email: string;
	// Add other user properties as needed
}

interface SignupData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

interface UserStore {
	user: User | null;
	loading: boolean;
	checkingAuth: boolean;
	signup: (data: SignupData) => Promise<{ success: boolean } | undefined>;
	login: (email: string, password: string) => Promise<{ success: boolean } | undefined>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	signup: async ({ username, email, password, confirmPassword }: SignupData) => {
		set({ loading: true });

		if (password !== confirmPassword) {
			set({ loading: false });
			toast.error("Passwords do not match");
			return;
		}

		try {
			const res = await axios.post("/user/create", { username, email, password });
			set({ user: res.data, loading: false });
			return {
				success: true
			}
		} catch (error: any) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	login: async (email: string, password: string) => {
		set({ loading: true });

		try {
			const res = await axios.post("/user/login", { email, password });
			set({ user: res.data, loading: false });
			return {
				success: true
			}
		} catch (error: any) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},

	logout: async () => {
		try {
			await axios.post("/user/logout");
			set({ user: null });
		} catch (error: any) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/user/profile");
			set({ user: response?.data?.user, checkingAuth: false });
		} catch (error) {
			set({ checkingAuth: false, user: null });
		}
	},
}));