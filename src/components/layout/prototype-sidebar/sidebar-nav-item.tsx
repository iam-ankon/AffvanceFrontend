'use client';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

export type SidebarSubLink = { label: string; href: string };

export type SidebarNavItemProps = {
  icon: LucideIcon;
  label: string;
  href?: string;
  /** When set without subItems, row is a link and active when this returns true */
  isActive?: (pathname: string) => boolean;
  subItems?: SidebarSubLink[];
};

export function SidebarNavItem({ icon: Icon, label, href, isActive, subItems }: SidebarNavItemProps) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const collapsed = state === 'collapsed' && !isMobile;

  const pathMatchesHref = (p: string, link: string) => {
    if (link === '/app') return p === '/app' || p === '/app/';
    if (link === '/app/subscription') return p === '/app/subscription' || p === '/app/subscription/';
    return p === link || p.startsWith(`${link}/`);
  };

  const [open, setOpen] = React.useState(() =>
    Boolean(subItems?.some((s) => pathMatchesHref(pathname, s.href)))
  );

  React.useEffect(() => {
    if (subItems?.some((s) => pathMatchesHref(pathname, s.href))) {
      setOpen(true);
    }
  }, [pathname, subItems]);

  const hasSubs = Boolean(subItems?.length);
  const active = hasSubs
    ? subItems!.some((s) => pathMatchesHref(pathname, s.href))
    : href
      ? isActive
        ? isActive(pathname)
        : pathMatchesHref(pathname, href)
      : false;

  if (hasSubs) {
    const button = (
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'group flex w-full items-center justify-between rounded-lg px-4 py-2.5 transition-all duration-200',
          collapsed && 'justify-center px-0',
          active ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover:bg-slate-50'
        )}
      >
        <div className={cn('flex items-center gap-3', collapsed && 'gap-0')}>
          <Icon size={20} className={cn('shrink-0', active ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600')} />
          {!collapsed && <span className="truncate text-sm font-medium">{label}</span>}
        </div>
        {!collapsed && (
          <ChevronDown size={16} className={cn('shrink-0 transition-transform duration-200', open && 'rotate-180')} />
        )}
      </button>
    );

    return (
      <div className="mb-1">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right" align="center">
              {label}
            </TooltipContent>
          </Tooltip>
        ) : (
          button
        )}
        {open && !collapsed && (
          <div className="relative ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
            {subItems!.map((item) => {
              const subActive = pathMatchesHref(pathname, item.href);
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={cn(
                    'block w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors',
                    subActive
                      ? 'bg-violet-50 font-medium text-violet-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-violet-600'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (href) {
    const link = (
      <Link
        href={href}
        className={cn(
          'group flex w-full items-center justify-between rounded-lg px-4 py-2.5 transition-all duration-200',
          collapsed && 'justify-center px-0',
          active ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover:bg-slate-50'
        )}
      >
        <div className={cn('flex items-center gap-3', collapsed && 'gap-0')}>
          <Icon size={20} className={cn('shrink-0', active ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600')} />
          {!collapsed && <span className="truncate text-sm font-medium">{label}</span>}
        </div>
      </Link>
    );

    return (
      <div className="mb-1">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right" align="center">
              {label}
            </TooltipContent>
          </Tooltip>
        ) : (
          link
        )}
      </div>
    );
  }

  return null;
}
