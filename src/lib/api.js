import axios from "axios";

const API_ROOT =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

export const api = axios.create({
  baseURL: `${API_ROOT.replace(/\/$/, "")}/api`
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const customerToken = localStorage.getItem("customerToken");

  const url = config.url || "";

  const isAdminRoute =
    url.startsWith("/admin") ||
    url.startsWith("/templates/admin") ||
    url.startsWith("/auth/admin");

  if (isAdminRoute && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  if (!isAdminRoute && customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`;
  }

  return config;
});