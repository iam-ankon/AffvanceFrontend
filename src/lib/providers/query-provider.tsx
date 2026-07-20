'use client';

import { NavigationProgress } from '@/components/navigation-progress';
import { ApiError } from '@/lib/api/client';
import { handleServerError } from '@/lib/utils/handle-server-error';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AxiosError } from 'axios';
// import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // const router = useRouter();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (process.env.NODE_ENV === 'development') {
            return false;
          }

          if (failureCount > 3) return false;
          if (failureCount > 3 && process.env.NODE_ENV === 'production') return false;

          // Handle both ApiError and AxiosError
          if (error instanceof ApiError && [401, 402, 403].includes(error.status)) return false;
          return !(error instanceof AxiosError && [401, 402, 403].includes(error.response?.status ?? 0));
        },
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        staleTime: 10 * 1000 // 10s
      },
      mutations: {
        onError: (error) => {
          // Centralized error actions for scalability
          const errorActions: Record<number, () => void> = {
            401: () => {
              toast.error(error.message);
              // router.push('/login');
            },
            403: () => {
              toast.error(error.message);
              // router.push('/forbidden');
            },
            500: () => toast.error(error.message)
          };

          let status: number | undefined;

          if (error instanceof ApiError) {
            status = error.status ?? error.code;
          } else if (error instanceof AxiosError) {
            status = error.response?.status ?? error.response?.data?.code;
          }

          if (status && errorActions[status]) {
            errorActions[status]!();
          } else {
            handleServerError(error);
          }
        }
      }
    },
    queryCache: new QueryCache({
      onError: (error) => {
        const errorActions: Record<number, () => void> = {
          401: () => {
            toast.error(error.message);
            // router.push('/login');
          },
          403: () => {
            toast.error(error.message);
            // router.push('/forbidden');
          },
          500: () => toast.error(error.message)
        };

        let status: number | undefined;
        if (error instanceof ApiError) {
          status = error.status ?? error.code;
        } else if (error instanceof AxiosError) {
          status = error.response?.status ?? error.response?.data?.code;
        }

        if (status && errorActions[status]) {
          errorActions[status]!();
        } else {
          handleServerError(error);
        }
      }
    })
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationProgress />
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={true} buttonPosition="top-left" />
      )}
    </QueryClientProvider>
  );
}
