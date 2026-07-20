'use client';

import { DataTableRowActions } from '@/app/(workspace)/app/blogs/_components/data-table-row-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { GeneratedContent } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { Row } from '@tanstack/react-table';
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Hash,
  ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type ComponentType } from 'react';

/* ---------------- STATUS CONFIG ---------------- */

const STATUS_CONFIG: Record<
  string,
  {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    color: string;
    bgColor: string;
    icon: ComponentType<{ className?: string }>;
  }
> = {
  generated: {
    variant: 'default',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: CheckCircle2
  },
  scheduled: {
    variant: 'secondary',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    icon: Clock
  },
  publishing: {
    variant: 'secondary',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: Activity
  },
  failed: {
    variant: 'destructive',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: Activity
  }
};

/* ---------------- HELPERS ---------------- */

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  try {
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }).format(date);
  } catch {
    return value ?? '—';
  }
};

const formatNumber = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : '—';

/* ---------------- COMPONENT ---------------- */

interface GeneratedBlogCardProps {
  blog: GeneratedContent;
  row: Row<GeneratedContent>;
}

export function GeneratedBlogCard({ blog, row }: GeneratedBlogCardProps) {
  const [imgError, setImgError] = useState(false);
  const statusKey = blog.status?.toLowerCase() ?? 'generated';
  const config = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.generated;
  const StatusIcon = config.icon;
  const thumbnailUrl =
    blog.featured_image_url ||
    blog.og_image ||
    blog.image_urls?.[0] ||
    blog.additional_image_urls?.[0] ||
    null;

  return (
    <article className="group bg-card hover:border-primary/50 relative overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md">
      <div className="from-primary/[0.02] absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex gap-4 p-4">
        {/* Featured Image */}
        <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg bg-muted">
          {thumbnailUrl && !imgError ? (
            <Image
              src={thumbnailUrl}
              alt={blog.title || 'Blog image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <Image
              src="/images/blog-placeholder.png"
              alt={blog.title || 'Blog placeholder'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-50 dark:opacity-40"
            />
          )}
          {/* Status badge overlay on image */}
          <div className="absolute left-2 top-2">
            <Badge
              variant={config.variant}
              className={cn('gap-1 text-[10px] font-medium shadow-sm', config.bgColor, config.color)}
            >
              <StatusIcon className="h-2.5 w-2.5" />
              {blog.status_display || blog.status || 'Generated'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="group-hover:text-primary line-clamp-2 text-base leading-tight font-semibold tracking-tight transition-colors">
                  {blog.meta_title || 'Untitled'}
                </h3>
                {blog.keyword && (
                  <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    <Hash className="h-3 w-3" />
                    <span className="font-medium">{blog.keyword}</span>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <Button asChild size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                  <Link href={`/app/blogs/${blog.id}`}>
                    <Eye className="h-3 w-3" />
                    View
                  </Link>
                </Button>
                <DataTableRowActions row={row} />
              </div>
            </div>

            {blog.request_title && (
              <p className="text-muted-foreground line-clamp-1 text-sm">{blog.meta_description}</p>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {typeof blog.word_count === 'number' && Number.isFinite(blog.word_count) && (
                <Stat icon={FileText} value={formatNumber(blog.word_count)} label="words" />
              )}
              {blog.created_at && (
                <Stat icon={CalendarClock} value={formatDateTime(blog.created_at)} label="created" />
              )}
              {blog.published_at && (
                <Stat
                  icon={ExternalLink}
                  value={formatDateTime(blog.published_at)}
                  label="published"
                  className="text-emerald-600 dark:text-emerald-400"
                />
              )}
            </div>

            <Button asChild size="sm" className="h-7 gap-1 text-xs">
              <Link href={`/app/blogs/${blog.id}`}>
                Open
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  className
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Icon className="text-muted-foreground h-3 w-3" />
      <span className="font-medium">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
