'use client';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface DynamicBreadcrumbProps {
  className?: string;
  /** Optional map for dynamic IDs → resource titles */
  resourceTitleMap?: Record<string, string>;
}

export default function DynamicBreadcrumb({
  className,
  resourceTitleMap = {}
}: DynamicBreadcrumbProps) {
  const pathname = usePathname();

  // Split pathname and filter empty segments
  const segments = pathname.split('/').filter(Boolean);

  if (!segments.length) return null; // hide breadcrumbs on root "/"

  // Check if segment is an ID
  const isIdSegment = (segment: string) => {
    return (
      /^[0-9]+$/.test(segment) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
      /^[a-z0-9]{16,}$/i.test(segment)
    );
  };

  // Format segment for label
  const formatSegmentLabel = (segment: string) => {
    if (isIdSegment(segment)) {
      return resourceTitleMap[segment] || 'Details';
    }
    return segment
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Remove /app prefix from breadcrumbs
  const appIndex = segments.indexOf('app');
  const visibleSegments = appIndex !== -1 ? segments.slice(appIndex + 1) : segments;

  // Define breadcrumb item type
  type BreadcrumbItem = {
    label: string;
    href: string;
    isLast: boolean;
  };

  type BreadcrumbItemWithEllipsis = BreadcrumbItem | { ellipsis: true };

  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = visibleSegments.map((segment, index) => {
    const href = '/app/' + visibleSegments.slice(0, index + 1).join('/');
    const isLast = index === visibleSegments.length - 1;
    const label = formatSegmentLabel(segment);
    return { label, href, isLast };
  });

  // Always start with Home (/app)
  const allBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/app', isLast: breadcrumbs.length === 0 },
    ...breadcrumbs
  ];

  // Collapse long breadcrumbs (e.g., > 4 segments)
  const MAX_VISIBLE = 4;
  let displayedCrumbs: BreadcrumbItemWithEllipsis[] = [...allBreadcrumbs];
  if (allBreadcrumbs.length > MAX_VISIBLE) {
    displayedCrumbs = [
      allBreadcrumbs[0], // Home
      { ellipsis: true }, // Collapse middle segments
      ...allBreadcrumbs.slice(-2) // Last two segments
    ];
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {displayedCrumbs.map((item, index) =>
          'ellipsis' in item ? (
            <React.Fragment key={`ellipsis-${index}`}>
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
              {index < displayedCrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ) : (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!item.isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
