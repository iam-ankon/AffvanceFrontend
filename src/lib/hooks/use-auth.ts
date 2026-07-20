import { ApiError, api } from '@/lib/api/client';
import type { LoginResponse } from '@/lib/api/types';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

// Login mutation with Zustand integration
export function useLogin() {
  const queryClient = useQueryClient();
  // const router = useRouter();
  const { setAuth, setLoading, setError } = useAuthStore();

  interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
  }

  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      setLoading(true);
      try {
        // Make the API call
        const response = await api.post<{
          status_code: number;
          success: boolean;
          message: string;
          path: string;
          timestamp: string;
          data: {
            user: {
              id: string;
              email: string;
              firstName: string;
              lastName: string;
              role: string;
              isVerified: boolean;
              createdAt: string;
              lastLoginAt: string;
            };
            tokens: {
              accessToken: string;
              refreshToken: string;
              tokenType: string;
              expiresIn: number;
              refreshExpiresIn: number;
            };
          };
        }>('auth/login/', credentials, {
          _skipErrorHandler: true
        });

        if (!response || !response.data) {
          throw new Error('No response from server');
        }

        const { user: userData, tokens: tokenData } = response.data;

        return {
          user: {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            isVerified: userData.isVerified,
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.email.split('@')[0],
            name: `${userData.firstName} ${userData.lastName}`.trim(),
            createdAt: userData.createdAt,
            updatedAt: userData.lastLoginAt || new Date().toISOString()
          },
          tokens: {
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            tokenType: tokenData.tokenType,
            expiresIn: tokenData.expiresIn,
            accessExpiresAt: new Date(Date.now() + tokenData.expiresIn * 1000).toISOString(),
            refreshExpiresAt: new Date(Date.now() + tokenData.refreshExpiresIn * 1000).toISOString()
          }
        };
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      if (!data?.user || !data?.tokens) {
        throw new Error('Invalid response from server');
      }

      try {
        // Store user and tokens
        setAuth(data.user, data.tokens);
        // Invalidate and refetch user-specific data
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

        return data; // Return the data for the component to use
      } catch (error) {
        console.error('Error in login onSuccess:', error);
        throw new Error('Failed to process login');
      }
    },
    onError: () => {
      // Error is handled by the form component (login-form.tsx)
    }
  });
}

// Register mutation
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setAuth, setLoading } = useAuthStore();

  return useMutation<LoginResponse, Error, RegisterData>({
    mutationFn: async (data) => {
      setLoading(true);
      try {
        // Use _skipErrorHandler to prevent the default error toast
        const response = await api.post<LoginResponse>('auth/register/', data, {
          _skipErrorHandler: true
        });
        return response;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      // Update auth state on successful registration
      if (data?.user && data?.tokens) {
        setAuth(data.user, data.tokens);
      }

      // Invalidate any auth-related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    // Don't handle errors here - they'll be handled in the form component
    onError: () => {}
  });
}
// Verify email mutation
export function useVerifyEmail() {
  const queryClient = useQueryClient();
  const { setAuth, setLoading } = useAuthStore();
  const router = useRouter();

  return useMutation<LoginResponse, Error, { uidb64: string; token: string }>({
    mutationFn: async ({ uidb64, token }) => {
      setLoading(true);
      try {
        const response = await api.get<LoginResponse>('auth/verify-email/', {
          params: {
            uid: uidb64,
            token: token
          },
          _skipErrorHandler: true
        });
        return response;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      // Update auth state if tokens are present
      if (data?.tokens) {
        setAuth(data.user, data.tokens);
      }
      // Invalidate any auth-related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      // Show success message
      toast.success('Email verified successfully!');
    },
    onError: (error: Error) => {
      // Log the error for debugging
      console.error('Email verification failed:', error);
      // Show error toast with user-friendly message
      toast.error('Verification failed', {
        description: error.message || 'The verification link is invalid or has expired.'
      });
    }
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        // Call your logout API here if needed
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
        // Even if logout API fails, we still want to clear the auth state
      }
    },
    onSuccess: () => {
      // Clear auth state
      clearAuth();

      // Clear all queries
      queryClient.clear();

      // Show success message
      toast.success('Logged out successfully');

      // Redirect to login page
      router.push('/login');

      // Ensure any cached data is cleared
      window.location.href = '/login';
    }
  });
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// Refresh token mutation
export function useRefreshToken() {
  const { setTokens, clearAuth, getRefreshToken } = useAuthStore();
  const router = useRouter();

  return useMutation<RefreshTokenResponse, Error>({
    mutationKey: ['refreshToken'],
    retry: 1, // Only retry once on failure
    retryDelay: 1000,
    mutationFn: async () => {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuth();
        router.push('/login');
        throw new Error('No refresh token available');
      }

      try {
        const response = await api.post<{ data: RefreshTokenResponse }>('/auth/refresh', {
          refresh_token: refreshToken
        });
        return response.data;
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 401 || error.status === 403) {
            // Invalid or expired refresh token
            clearAuth();
          }
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in
      });
    },
    onError: (error: unknown) => {
      console.error('[useRefreshToken] Token refresh failed:', error);

      // Get error message from API response or use a default message
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : error instanceof Error
            ? error.message
            : 'Your session has expired. Please log in again.';

      // Show error toast to user with the actual error message
      toast.error('Session Error', {
        description: errorMessage
      });

      // Clear auth state
      clearAuth();

      // Only redirect if this is a client-side navigation
      if (typeof window !== 'undefined') {
        // Don't redirect if we're already on the login page
        if (!window.location.pathname.includes('/login')) {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
  });
}
