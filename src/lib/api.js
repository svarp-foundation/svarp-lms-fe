/**
 * Centralised Axios instance for all API calls.
 *
 * Auth headers are applied by AuthContext (via interceptors and
 * axios.defaults.headers), so every request made through this
 * instance is automatically authenticated — no manual
 * localStorage.getItem("token") calls needed in components.
 */
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_URL });

// Request interceptor to attach bearer token dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
