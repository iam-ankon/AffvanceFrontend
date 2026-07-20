'use client';

import { GeneratedBlogCard } from '@/features/blogs/components/generated/generated-blog-card';
import { GeneratedContent } from '@/lib/api/types';
import { ColumnDef } from '@tanstack/react-table';

export function getGeneratedBlogColumns(): ColumnDef<GeneratedContent>[] {
  return [
    {
      id: 'generated_card',
      header: () => <span className="sr-only">Generated content</span>,
      cell: ({ row }) => <GeneratedBlogCard blog={row.original} row={row} />,
      enableSorting: false,
      enableColumnFilter: false
    }
  ];
}
