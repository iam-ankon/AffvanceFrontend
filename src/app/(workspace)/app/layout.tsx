import { ProtectedRoute } from '@/components/auth/protected-route';
import { Suspense } from 'react';
import { AppSidebar } from '@/components/layout/app-sitebar';
import { UpgradeModal } from '@/components/upgrade-modal';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={null}>
      <ProtectedRoute>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <div
            id="content"
            className={cn(
              'ml-auto w-full max-w-full',
              'md:peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-0rem)]',
              'md:peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
              'sm:transition-[width] sm:duration-200 sm:ease-linear',
              'flex h-svh flex-col',
              'group-data-[scroll-locked=1]/body:h-full',
              'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
            )}
          >
            {children}
          </div>
          <Toaster richColors theme="light" duration={4000} />
        </SidebarProvider>
      </ProtectedRoute>
    </Suspense>
  );
}
