import axios from "axios";

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://condominio-api-hytm.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const isLoginRequest =
    config.method?.toLowerCase() === "post" && config.url?.replace(API_URL, "") === "/auth/login";

  if (isLoginRequest && config.data) {
    if (typeof config.data === "string") {
      try {
        const data = JSON.parse(config.data) as { email?: string; password?: string; senha?: string };
        config.data = JSON.stringify({
          email: data.email,
          password: data.password ?? data.senha,
        });
      } catch {
        /* keep original data if it is not JSON */
      }
    } else if (typeof config.data === "object") {
      const data = config.data as { email?: string; password?: string; senha?: string };
      config.data = {
        email: data.email,
        password: data.password ?? data.senha,
      };
    }
  }

  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("cb_token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register") {
        window.localStorage.removeItem("cb_token");
        window.localStorage.removeItem("cb_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown, fallback = "Ocorreu um problema de conexão."): string {
  const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}