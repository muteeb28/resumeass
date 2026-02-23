import axios from "axios";

const axiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
	withCredentials: true, // send cookies to the server
});

export default axiosInstance;