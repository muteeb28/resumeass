import axios from "axios";
import { useUserStore } from "@/stores/useUserStore";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 1. Check if the backend is throwing an authentication error
    // (Common triggers: Status 401 Unauthorized or a specific backend error code)
    if (
      error.response?.status === 401 &&
      error.response?.data?.errorCode === 'GLOBAL_AUTH_ERR'
    ) {
      // 2. Wipe the Zustand store completely
      // This resets state.user to null and automatically clears your 'jobflix_user_ui' cookie
      useUserStore.getState().setUser(null);

      if (typeof window !== "undefined") {
        window.location.href = '/';
      }
      
      // Stop the error chain since we are forcing a window relocation redirect
      return new Promise(() => {}); 
    }

    // Pass standard non-auth errors right back down to your component try/catch blocks
    return Promise.reject(error);
  }
);

export default axiosInstance;