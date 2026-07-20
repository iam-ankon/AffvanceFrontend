'use client';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      defaultTheme="light"
      disableTransitionOnChange
      attribute="class"
      enableSystem={false}
    >
      {children}
    </NextThemeProvider>
  );
}
