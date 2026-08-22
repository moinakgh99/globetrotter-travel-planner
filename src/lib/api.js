import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach Bearer token and normalize /api path
api.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
    config.url = '/api' + (config.url.startsWith('/') ? '' : '/') + config.url;
  }
  const token = localStorage.getItem("globetrotter_token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper auth methods
export const getToken = () => localStorage.getItem("globetrotter_token") || localStorage.getItem("token");

export const setAuthSession = (token, user) => {
  localStorage.setItem("globetrotter_token", token);
  localStorage.setItem("token", token);
  if (user) {
    localStorage.setItem("globetrotter_user", JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));
  }
};

export const removeAuthSession = () => {
  localStorage.removeItem("globetrotter_token");
  localStorage.removeItem("token");
  localStorage.removeItem("globetrotter_user");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("globetrotter_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};

export default api;
