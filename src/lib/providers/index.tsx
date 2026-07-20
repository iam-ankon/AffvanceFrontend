'use client';
import GoogleAuthProvider from './auth-provider';
import NuqsProvider from './nuqs-provider';
import { PaddleProvider } from './paddle-provider';
import QueryProvider from './query-provider';
import ThemeProvider from './theme-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleAuthProvider>
      <NuqsProvider>
        <QueryProvider>
          <PaddleProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </PaddleProvider>
        </QueryProvider>
      </NuqsProvider>
    </GoogleAuthProvider>
  );
}
