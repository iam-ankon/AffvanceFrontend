'use client';

import type { AuthTokens, User } from '@/lib/api/types';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware';

interface JwtPayload {
  exp: number;
  [key: string]: unknown;
}

interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens) => void;
  setAuth: (user: User, tokens: AuthTokens) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (updates: Partial<User>) => void;

  // Computed getters
  getFullName: () => string;
  isTokenExpired: () => boolean;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  isTokenValid: () => boolean;
}

// Create a custom storage object
const storage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        if (!user) {
          return set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }

        const newUser = {
          id: user.id || '',
          email: user.email || '',
          username: user.username || user.email?.split('@')[0] || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: user.role || 'user',
          isVerified: user.isVerified || false,
          name:
            user.name ||
            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
            user.email?.split('@')[0] ||
            'User',
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString(),
          avatar: user.avatar
        };

        return set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      },

      setTokens: (tokens) => {
        return set(() => ({
          tokens,
          isAuthenticated: !!tokens?.accessToken,
          isLoading: false,
          error: null
        }));
      },

      setAuth: (user: Partial<User> & { id?: string | number }, tokens: AuthTokens) => {
        if (!user || !tokens) {
          console.error('[AuthStore] Invalid arguments to setAuth:', { user, tokens });
          return set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Invalid authentication data'
          });
        }

        // Validate required token fields
        if (!tokens.accessToken || !tokens.refreshToken) {
          console.error('[AuthStore] Missing required token fields:', {
            hasAccessToken: !!tokens.accessToken,
            hasRefreshToken: !!tokens.refreshToken
          });
          return set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Invalid token data: missing required fields'
          });
        }

        // Map the API response to our internal user format with required fields
        const newUser: User = {
          id: String(user.id || ''),
          email: user.email || '',
          username: user.email?.split('@')[0] || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: user.role || 'user',
          isVerified: user.isVerified || false,
          name: user.name || user.email?.split('@')[0] || 'User',
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString(),
          avatar: user.avatar || '',
          // Explicitly spread only known user properties to avoid type issues
          ...(user as Partial<User>)
        };

        return set({
          user: newUser,
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenType: tokens.tokenType || 'Bearer',
            expiresIn: tokens.expiresIn,
            accessExpiresAt: tokens.accessExpiresAt,
            refreshExpiresAt: tokens.refreshExpiresAt
          },
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      },

      clearAuth: () =>
        set(() => ({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false
        })),

      setLoading: (loading) =>
        set(() => ({
          isLoading: loading,
          error: null // Clear error when loading starts
        })),

      setError: (error) =>
        set(() => ({
          error
        })),

      updateUser: (updates) =>
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...updates };
          return {
            user: {
              ...updatedUser,
              name: `${updatedUser.firstName} ${updatedUser.lastName}` // Recompute name
            }
          };
        }),

      // Computed getters
      getFullName: () => {
        const { user } = get();
        if (!user) return '';
        return `${user.firstName} ${user.lastName}`;
      },

      isTokenExpired: () => {
        const { tokens } = get();
        if (!tokens?.accessToken) return true;

        try {
          const decoded = jwtDecode<JwtPayload>(tokens.accessToken);
          const currentTime = Date.now() / 1000;
          return (decoded.exp || 0) < currentTime;
        } catch (error) {
          console.error('Error decoding token:', error);
          return true;
        }
      },

      isTokenValid: () => {
        const { tokens, isTokenExpired } = get();

        // Check if tokens exist and have required fields
        if (!tokens?.accessToken || !tokens?.refreshToken) {
          return false;
        }

        // Check if token is expired
        const expired = isTokenExpired();
        if (expired) {
          return false;
        }

        try {
          const tokenParts = tokens.accessToken.split('.');
          if (tokenParts.length !== 3) {
            return false;
          }

          return true;
        } catch (error) {
          console.error('Error validating token:', error);
          return false;
        }
      },

      getAccessToken: () => {
        const { tokens } = get();
        return tokens?.accessToken || null;
      },

      getRefreshToken: () => {
        const { tokens } = get();
        return tokens?.refreshToken || null;
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => storage.getItem(name),
        setItem: (name, value) => storage.setItem(name, value),
        removeItem: (name) => storage.removeItem(name)
      })),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated
      }),
      version: 1,
      migrate: (persistedState: unknown, _version: number) => {
        // Add any migration logic here if needed
        return persistedState as Partial<AuthState>;
      }
    }
  )
);

// Selectors for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useTokens = () => useAuthStore((state) => state.tokens);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
