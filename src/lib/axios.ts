import axios from "axios";
import { useUserStore } from "@/stores/useUserStore";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_JOBFILX_APIURL,
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
      error.response?.status === 401 || 
      error.response?.data?.errorCode === 'GLOBAL_AUTH_ERR'
    ) {
      // 2. Wipe the Zustand store completely
      // This resets state.user to null and automatically clears your 'jobflix_user_ui' cookie
      useUserStore.getState().setUser(null);

      if (typeof window !== "undefined") {
        // 3. Smart Multi-Subdomain Redirect Configuration
        // Captures the current subdomain URL so your login page knows exactly where to send them back after re-authenticating
        const currentUrl = encodeURIComponent(window.location.href);
        
        // Constructs a clean fallback pointing to your main login page
        // If your login logic is on account.jobflix.in, change this to match your central auth domain.
        const loginBaseUrl = process.env.NEXT_PUBLIC_LOGIN_URL || "/login"; 
        
        window.location.href = `${loginBaseUrl}?next=${currentUrl}`;
      }
      
      // Stop the error chain since we are forcing a window relocation redirect
      return new Promise(() => {}); 
    }

    // Pass standard non-auth errors right back down to your component try/catch blocks
    return Promise.reject(error);
  }
);

export default axiosInstance;