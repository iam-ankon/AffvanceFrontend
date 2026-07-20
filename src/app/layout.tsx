import { Toaster } from '@/components/ui/sonner';
import Providers from '@/lib/providers';
import '@/styles/index.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Affvance',
  description: 'Affvance - Rank . Reach . Revenue'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full scroll-smooth">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster richColors theme="light" duration={4000} />
      </body>
    </html>
  );
}
