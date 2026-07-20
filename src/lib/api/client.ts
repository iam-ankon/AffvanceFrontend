import { useAuthStore } from '@/lib/stores/auth-store';
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig
} from 'axios';
import type { AxiosProgressEvent } from 'axios';

// Define error details type
type ErrorDetails = Record<string, unknown> | string | string[] | undefined;

// Extend Axios types to include our custom metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    _skipAuthRefresh?: boolean;
    _retry?: boolean;
    _skipErrorHandler?: boolean;
  }
}

// Error handling
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: ErrorDetails;
  timestamp?: string;

  constructor(message: string, status: number, code?: string, details?: ErrorDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  static fromAxiosError(error: unknown): ApiError {
    const axiosError = error as { response?: { status: number; data: unknown } };

    if (axiosError.response) {
      const { status, data } = axiosError.response as {
        status: number;
        data: {
          message?: string;
          error?: string | { message?: string; code?: string | number; details?: unknown };
          code?: string | number;
          details?: unknown;
        };
      };

      // Handle different error response formats
      const errorMessage =
        (data && 'message' in data && data.message) ||
        (data?.error &&
          typeof data.error === 'object' &&
          'message' in data.error &&
          data.error.message) ||
        (data?.error && typeof data.error === 'string' && data.error) ||
        (error instanceof Error ? error.message : String(error)) ||
        'An error occurred';

      // Safely extract error details
      const errorCode =
        (data?.code ? String(data.code) : undefined) ||
        (data?.error && typeof data.error === 'object' && data.error.code
          ? String(data.error.code)
          : undefined);

      const errorDetails = (data?.details ? data.details : undefined) ||
        (data?.error && typeof data.error === 'object' ? data.error.details : undefined) || {
          error: 'Unknown error occurred'
        };

      return new ApiError(errorMessage, status, errorCode, errorDetails as Record<string, unknown>);
    }

    // Handle case where there's no response (network error, etc.)
    if (error instanceof Error) {
      interface ErrorWithCode extends Error {
        code?: string | number;
      }

      const errorWithCode = error as ErrorWithCode;
      const errorCode = errorWithCode.code ? String(errorWithCode.code) : undefined;

      return new ApiError(error.message || 'An unknown error occurred', 0, errorCode, {
        message: error.message,
        stack: error.stack
      });
    }

    // Fallback for non-Error objects
    return new ApiError('An unknown error occurred', 0, 'UNKNOWN_ERROR', { error: String(error) });
  }
}

// API response wrapper
export class ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  [key: string]: unknown; // Allow additional properties

  constructor(init: {
    data: T;
    message?: string;
    success: boolean;
    meta?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
  }) {
    this.data = init.data;
    this.message = init.message || '';
    this.success = init.success;
    this.meta = init.meta;
  }
}

// Token interfaces
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private readonly defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds
      headers: this.defaultHeaders
    });

    // Set default headers using Axios's headers methods
    Object.entries(this.defaultHeaders).forEach(([key, value]) => {
      if (this.client.defaults.headers.common) {
        this.client.defaults.headers.common[key] = value;
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const tokens = useAuthStore.getState().tokens;
        if (tokens?.accessToken && !config._skipAuthRefresh) {
          config.headers.Authorization = `${tokens.tokenType || 'Bearer'} ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Check if we should skip the default error handler
        const skipErrorHandler = error.config?._skipErrorHandler || false;
        const apiError = ApiError.fromAxiosError(error);

        // Handle 402 Payment Required — open upgrade modal.
        // Callers that handle 402 themselves (e.g. credit-pack checkout where
        // 402 means "subscribe first" rather than "out of credits") opt out
        // by passing _skipErrorHandler: true.
        if (apiError.status === 402 && !skipErrorHandler) {
          const { useCreditStore } = await import('@/lib/stores/credit-store');
          // Support both top-level and nested standardized error payloads.
          const rawData = (error as { response?: { data?: Record<string, unknown> } })
            ?.response?.data ?? {};
          const nestedData =
            rawData.data && typeof rawData.data === 'object'
              ? (rawData.data as Record<string, unknown>)
              : {};
          const message =
            (rawData.message as string) ||
            (rawData.detail as string) ||
            apiError.message ||
            'Insufficient credits';
          const creditType =
            (rawData.credit_type as 'ai' | 'keyword') ||
            (nestedData.credit_type as 'ai' | 'keyword') ||
            null;
          useCreditStore.getState().openUpgradeModal(message, creditType);
        }

        // If we should skip the default handler, add a flag to the error
        if (skipErrorHandler) {
          Object.defineProperty(apiError, 'skipDefaultHandler', {
            value: true,
            writable: false,
            enumerable: true
          });
        }

        return Promise.reject(apiError);
      }
    );
  }

  private processQueue(error: Error | null, token: string | null = null): void {
    if (token) {
      this.refreshSubscribers.forEach((callback) => callback(token));
    }
    this.refreshSubscribers = [];
  }

  private async request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { status: number }; config?: { _retry?: boolean } };
      if (axiosError.response?.status === 401 && !axiosError.config?._retry) {
        // Handle token refresh
        return this.handleTokenRefresh<T>(error as Error);
      }
      throw error;
    }
  }

  private async handleTokenRefresh<T>(error: unknown): Promise<T> {
    // Check if the error has a config property with the correct type
    const axiosError = error as { config?: AxiosRequestConfig & { _retry?: boolean } };
    const originalRequest = axiosError.config;

    // If there's no original request or it's already been retried, reject
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark the request as retried
    originalRequest._retry = true;

    try {
      const tokens = await this.refreshToken();
      if (tokens?.accessToken) {
        this.setAuthToken(tokens.accessToken);

        // Ensure headers exist before trying to set them
        const headers = originalRequest.headers || {};
        headers.Authorization = `Bearer ${tokens.accessToken}`;
        originalRequest.headers = headers;

        return this.request(originalRequest);
      }
      throw new Error('No access token received from refresh');
    } catch (_error) {
      // If refresh fails, clear auth and redirect to login
      this.clearAuthToken();
      const authStore = useAuthStore.getState();
      authStore.clearAuth();
      window.location.href = '/login';
      return Promise.reject(new Error('Token refresh failed'));
    }
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  patch<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const authStore = useAuthStore.getState();
      const refreshToken = authStore.tokens?.refreshToken;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.client.post<{
        accessToken: string;
        refreshToken: string;
      }>('/auth/refresh-token', { refreshToken });

      authStore.setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      });

      return response.data;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  async upload<T = unknown>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    };

    return this.post<T>(url, formData, config);
  }

  // Utility methods
  setAuthToken(token: string): void {
    if (this.client.defaults.headers.common) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  clearAuthToken(): void {
    if (this.client.defaults.headers.common) {
      delete this.client.defaults.headers.common['Authorization'];
      delete (this.client.defaults.headers.common as Record<string, unknown>)['Authorization'];
    }
  }

  setBaseURL(baseURL: string) {
    this.client.defaults.baseURL = baseURL;
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export types
export type { AuthTokens, RefreshTokenResponse };
