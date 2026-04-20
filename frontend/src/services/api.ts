import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { handleApiError } from '@/utils/error-handler';

/**
 * Browser: same-origin `/api/v1` (Caddy proxies) or absolute NEXT_PUBLIC_API_URL.
 * Node (Next SSR / server): must use INTERNAL_API_URL (e.g. http://backend:3001/api/v1 in Docker)
 * - relative `/api/v1` would hit the Next server, not Nest, and causes ECONNRESET / redirect errors.
 */
function resolveApiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  if (typeof window !== 'undefined') {
    try {
      const isHttps = window.location.protocol === 'https:';
      const resolved = new URL(publicUrl, window.location.origin);
      if (isHttps && resolved.protocol === 'http:' && resolved.hostname === window.location.hostname) {
        resolved.protocol = 'https:';
      }
      return resolved.toString().replace(/\/$/, '');
    } catch {
      return publicUrl;
    }
  }

  const internal = process.env.INTERNAL_API_URL?.replace(/\/$/, '');
  if (internal) return internal;

  if (publicUrl.startsWith('http://') || publicUrl.startsWith('https://')) {
    return publicUrl.replace(/\/$/, '');
  }

  return 'http://127.0.0.1:3001/api/v1';
}

const API_URL = resolveApiBaseUrl();

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      // Upper bound so a stalled upstream (proxy, DB, etc.) can never leave the
      // UI showing an infinite spinner. Long enough for large report queries
      // and file uploads; callers that need longer can override per-request.
      timeout: 45_000,
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // When sending FormData (file uploads), let the browser set
        // Content-Type automatically so it includes the multipart boundary.
        // The default 'application/json' would strip the boundary and break uploads.
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken } = response.data;
              this.setToken(accessToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            if (typeof window !== 'undefined') {
              // Redirect to the correct login page based on where the user is
              const isPortal = window.location.pathname.startsWith('/portal');
              window.location.href = isPortal ? '/portal/login' : '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        // Convert error to user-friendly message
        const friendlyMessage = handleApiError(error);
        
        // Log error for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.error('API Error:', friendlyMessage);
        }

        // Attach friendly message to error for components to use
        error.userMessage = friendlyMessage;

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  }

  private getRefreshToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.get<T>(url, config);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.delete<T>(url, config);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const apiService = new ApiService();
export const api = apiService; // Alias for backward compatibility
export default apiService;
