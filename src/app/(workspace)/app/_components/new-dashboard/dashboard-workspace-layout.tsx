'use client';

import CreditDropdown from '@/components/credit-dropdown';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Bell } from 'lucide-react';

const titles: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/': 'Dashboard',
  '/app/analytics': 'Analytics',
  '/app/monetisation': 'Monetisation'
};

export function DashboardWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segment =
    pathname.startsWith('/app/analytics')
      ? 'Analytics'
      : pathname.startsWith('/app/monetisation')
        ? 'Monetisation'
        : titles[pathname] ?? 'Dashboard';

  return (
    <>
      <Header fixed>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h2 className="truncate text-lg font-bold text-slate-900">{segment} Overview</h2>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            className="hidden p-2 text-slate-400 transition-colors hover:text-slate-600 sm:block"
            aria-label="Notifications"
          >
            <span className="relative inline-flex">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
            </span>
          </button>
          <CreditDropdown />
          <ProfileDropdown />
        </div>
      </Header>
      <Main fixed className="bg-slate-50 text-slate-900">
        <div className="flex-1 overflow-auto">{children}</div>
      </Main>
    </>
  );
}
