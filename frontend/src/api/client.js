import axios from "axios";
import { getToken, clearAuth } from "../state/authStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // Token expired/invalid -> logout
      clearAuth();
      // We don't hard-redirect here; App detects missing token and navigates to /login.
    }
    return Promise.reject(err);
  }
);

export default api;
