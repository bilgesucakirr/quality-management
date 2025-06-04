// src/api/AxiosInstance.ts
import axios from "axios";
import { useAuthStore } from "../store/AuthStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // Headers are set dynamically by the interceptor
  withCredentials: false,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set Content-Type header only if it's not already set and it's not FormData
    // Axios will automatically set 'multipart/form-data' for FormData
    if (!config.headers["Content-Type"]) {
      if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Authentication failed or token expired. Clearing token.");
      useAuthStore.getState().clearToken();
      // Optionally redirect to login. For a simple setup, a full reload might be easiest
      // if Layout/AuthGuard already redirects unauthenticated users.
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;