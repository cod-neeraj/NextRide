import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

const AUTH_BASE_URL = "http://localhost:2021"; // <-- set your real auth service URL here
const REFRESH_ENDPOINT = "/api/auth/refresh";

interface CreateApiOptions {
  baseURL: string;
  withCredentials?: boolean;
}

// Shared across ALL instances, so if 5 microservice calls 401 at once,
// only ONE refresh call fires, not 5.
let isRefreshing = false;
let pendingQueue: { resolve: (v?: unknown) => void; reject: (e: unknown) => void }[] = [];

function flushQueue(error: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  pendingQueue = [];
}

// Single dedicated axios instance for the refresh call — always points to AUTH_BASE_URL
const refreshClient: AxiosInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
});

export function createApi(options: CreateApiOptions): AxiosInstance {
  const { baseURL, withCredentials = true } = options;

  const api = axios.create({ baseURL, withCredentials });

  api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest =
        error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      console.log(
        "API error:",
        error.response?.status,
        originalRequest.url,
        originalRequest._retry
      );
      if (
        error.response?.status !== 401 ||
        originalRequest._retry ||
        originalRequest.url?.includes("/user/me")
      ) {
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes(REFRESH_ENDPOINT)) {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshClient.post(REFRESH_ENDPOINT);

        flushQueue(null);

        return api(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError);

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return api;
}