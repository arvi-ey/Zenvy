import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };
let refreshRequest: Promise<boolean> | null = null;

axiosInstance.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as RetryableRequest | undefined;
    const isAuthRequest = /\/auth\/(admin\/)?(sign-in|sign-up|refresh)$/.test(config?.url ?? '');
    if (error.response?.status === 401 && config && !config._retry && !isAuthRequest) {
      config._retry = true;
      refreshRequest ??= axios
        .post(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true, timeout: 15000 })
        .then(() => true)
        .catch(() => false)
        .finally(() => {
          refreshRequest = null;
        });

      if (await refreshRequest) {
        return axiosInstance(config);
      }
      window.dispatchEvent(new Event('zenvy:unauthorized'));
    }

    let message = 'An unexpected error occurred';
    let statusCode = 500;
    if (error.response) {
      statusCode = error.response.status;
      const data = error.response.data as { message?: string; error?: string };
      message = data?.message || data?.error || `Request failed with status ${statusCode}`;
    } else if (error.request) {
      message = 'Cannot connect to the backend server.';
      statusCode = 0;
    }

    return Promise.reject({ statusCode, message, originalError: error });
});

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

function unwrapResponse<T>(response: AxiosResponse<ApiResponse<T> | T>): T {
  const payload = response.data;
  if (typeof payload === 'object' && payload !== null && 'success' in payload) {
    return payload.data as T;
  }
  return payload as T;
}

export const apiClient = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(await axiosInstance.get<ApiResponse<T> | T>(url, config));
  },
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(await axiosInstance.post<ApiResponse<T> | T>(url, data, config));
  },
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(await axiosInstance.put<ApiResponse<T> | T>(url, data, config));
  },
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(await axiosInstance.patch<ApiResponse<T> | T>(url, data, config));
  },
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(await axiosInstance.delete<ApiResponse<T> | T>(url, config));
  },
};
