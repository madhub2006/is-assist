import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api-production-24e25.up.railway.app/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT access token to every outgoing request if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("is_assist_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized responses to clear token and redirect if expired
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config.url.includes("/auth/login");
      if (!isAuthEndpoint) {
        localStorage.removeItem("is_assist_token");
        localStorage.removeItem("is_assist_user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
