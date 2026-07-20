'use client';

import { useRefreshToken } from '@/lib/hooks/use-auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isTokenValid, isLoading, tokens } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { mutate: refreshToken } = useRefreshToken();

  // Track client mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // If we're still loading, do nothing
    if (isLoading) {
      return;
    }

    // If not authenticated but we have a refresh token, try to refresh
    if (!isAuthenticated && tokens?.refreshToken && !refreshAttempted) {
      setIsRefreshing(true);
      setRefreshAttempted(true);

      refreshToken(undefined, {
        onSettled: () => {
          setIsRefreshing(false);
        }
      });
      return;
    }

    // If still not authenticated after refresh attempt, redirect to login
    if (!isAuthenticated) {
      const redirectPath = encodeURIComponent(
        `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      );
      window.location.href = `/login?redirect=${redirectPath}`;
      return;
    }

    // If authenticated but token is invalid and we have a refresh token, try to refresh
    if (
      isAuthenticated &&
      !isTokenValid() &&
      tokens?.refreshToken &&
      !isRefreshing &&
      !refreshAttempted
    ) {
      setIsRefreshing(true);
      setRefreshAttempted(true);

      refreshToken(undefined, {
        onSettled: () => {
          setIsRefreshing(false);
        },
        onError: (error) => {
          console.error('[ProtectedRoute] Refresh error:', error);
          // Clear auth state on refresh error
          useAuthStore.getState().clearAuth();
          const redirectPath = encodeURIComponent(
            `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
          );
          window.location.href = `/login?redirect=${redirectPath}`;
        }
      });
    } else if (isAuthenticated && !isTokenValid() && refreshAttempted) {
      // If we already attempted to refresh but still not valid, redirect to login
      useAuthStore.getState().clearAuth();
      const redirectPath = encodeURIComponent(
        `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      );
      window.location.href = `/login?redirect=${redirectPath}`;
    }
  }, [
    mounted,
    isAuthenticated,
    isLoading,
    isTokenValid,
    pathname,
    router,
    searchParams,
    tokens,
    refreshToken,
    isRefreshing,
    refreshAttempted
  ]);

  // Before mount, render a consistent loading state for both server and client
  // to avoid hydration mismatch
  if (!mounted || isLoading || isRefreshing) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">
          {isRefreshing ? 'Refreshing session...' : 'Loading...'}
        </p>
      </div>
    );
  }

  // If not authenticated, show loading state (will redirect in useEffect)
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If token is invalid after refresh attempt, show loading state
  if (!isTokenValid()) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  // Authenticated and token is valid — render children
  return <>{children}</>;
}
