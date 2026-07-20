'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar';
import { SidebarNavItem } from '@/components/layout/prototype-sidebar/sidebar-nav-item';
import { hasPermission } from '@/lib/auth/permissions';
import { useUser } from '@/lib/stores/auth-store';
import { useActiveSubscription } from '@/features/subscriptions/hooks/use-subscriptions';
import {
  Activity,
  BarChart3,
  DollarSign,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Wallet,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

const ARTICLE_LINKS = [
  { label: 'Create Blog', href: '/app/blogs/new' },
  { label: 'Blog List', href: '/app/blogs' },
  { label: 'Requested Blogs', href: '/app/blogs/requested' }
] as const;

const KEYWORD_LINKS = [
  { label: 'Generate Keywords', href: '/app/keyword-lab' },
  { label: 'My Keywords', href: '/app/keyword-history' },
  { label: 'History', href: '/app/keyword-history' }
] as const;

const AGENCY_LINKS = [
  { label: 'Dashboard', href: '/app/agency/dashboard' },
  { label: 'Members', href: '/app/agency/members' },
  { label: 'Content', href: '/app/agency/content' },
  { label: 'Credits & Usage', href: '/app/agency/credits' },
  { label: 'Billing', href: '/app/agency/billing' },
  { label: 'Analytics', href: '/app/agency/analytics' }
] as const;

const SUBSCRIPTION_LINKS = [
  { label: 'Overview', href: '/app/subscription' },
  { label: 'Plans', href: '/app/subscription/plans' }
] as const;

function initialsFromUser(user: { firstName?: string; lastName?: string; email: string }) {
  const n = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (n.length >= 2) {
    const parts = n.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  const e = user.email?.trim() ?? '?';
  return e.slice(0, 2).toUpperCase();
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUser();
  const { data: activeSub } = useActiveSubscription();

  if (!user) return null;

  const normalizedRole = (user.role ?? '').toLowerCase();
  const known: ('author' | 'agency' | 'admin')[] = ['author', 'agency', 'admin'];
  const roles: ('author' | 'agency' | 'admin')[] = known.includes(normalizedRole as 'author' | 'agency' | 'admin')
    ? [normalizedRole as 'author' | 'agency' | 'admin']
    : [];

  const userWithRoles = {
    ...user,
    roles,
    id: user.id || ''
  };

  const showAgency = hasPermission(userWithRoles, 'manage:agency');
  const planLabel =
    activeSub?.plan_details?.name ?? (activeSub?.is_active ? 'Active plan' : 'Free plan');

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="border-0 shadow-none [&_[data-slot=sidebar-inner]]:rounded-none [&_[data-slot=sidebar-inner]]:border-0 [&_[data-slot=sidebar-inner]]:border-r [&_[data-slot=sidebar-inner]]:border-slate-200 [&_[data-slot=sidebar-inner]]:bg-white [&_[data-slot=sidebar-inner]]:shadow-none"
      {...props}
    >
      <SidebarHeader className="border-0 bg-white p-6 group-data-[collapsible=icon]:p-3">
        <Link href="/app" className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600">
            <Zap size={20} className="fill-white text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-bold leading-tight text-slate-900">Affvance</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rank . Reach . Revenue</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-white px-4 py-4 text-slate-900 group-data-[collapsible=icon]:px-2">
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 group-data-[collapsible=icon]:hidden">Main Menu</p>

          <SidebarNavItem icon={LayoutDashboard} label="Dashboard" href="/app" />

          <SidebarNavItem icon={FileText} label="Articles" subItems={[...ARTICLE_LINKS]} />

          <SidebarNavItem icon={Search} label="Keyword Lab" subItems={[...KEYWORD_LINKS]} />

          <SidebarNavItem icon={BarChart3} label="Analytics" href="/app/analytics" />

          <SidebarNavItem icon={DollarSign} label="Monetisation" href="/app/monetisation" />

          <SidebarNavItem icon={Wallet} label="Subscription" subItems={[...SUBSCRIPTION_LINKS]} />

          {showAgency && (
            <>
              <p className="mb-4 mt-8 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 group-data-[collapsible=icon]:hidden">Agency</p>
              <SidebarNavItem icon={Activity} label="Agency" subItems={[...AGENCY_LINKS]} />
            </>
          )}

          <p className="mb-4 mt-8 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 group-data-[collapsible=icon]:hidden">Settings</p>

          <SidebarNavItem icon={Settings} label="Settings" href="/app/settings/publishing-accounts" />
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 bg-white p-4 group-data-[collapsible=icon]:p-2">
        <div className="rounded-xl bg-slate-50 p-3 group-data-[collapsible=icon]:p-1.5">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
              {initialsFromUser(user)}
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-bold text-slate-900">
                {`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email}
              </p>
              <p className="truncate text-[10px] text-slate-500">{planLabel}</p>
            </div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
