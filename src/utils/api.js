import axios from "axios";
import { clearAuth } from "./auth";

const api = axios.create({
  baseURL: "https://exam-platform-sigma.vercel.app/api/v1",
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.token = `${token}`;
  }
  return config;
});

// Response interceptor (من غير refresh token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("🌐 Network/Server error:", error);
    } else {
      console.error("❌ API Error:", error.response?.data || error.message);
      // لو السيرفر رجّع Unauthorized (401)
      if (error.response.status === 401) {
        clearAuth();
        window.location.href = "/login"; // رجّع المستخدم للـ login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
