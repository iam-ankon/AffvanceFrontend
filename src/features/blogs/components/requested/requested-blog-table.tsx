'use client';

import { DataTable } from '@/components/data-table/data-table';
import { getBlogColumns } from '@/features/blogs/components/requested/blog-columns';
import { useDataTable } from '@/hooks/use-data-table';
import { ContentRequest } from '@/lib/api/types';
import { useDeleteContentRequest } from '@/lib/hooks/use-content-requests';
import { useRouter } from 'next/navigation';
import * as React from 'react';

interface BlogTableProps {
  data: ContentRequest[];
  pagination?: {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// 🚀 Component
export function RequestedBlogTable({ data, pagination }: BlogTableProps) {
  const router = useRouter();
  const deleteMutation = useDeleteContentRequest();

  const handleView = React.useCallback((row: ContentRequest) => {
    router.push(`/app/blogs/requested/${row.id}`);
  }, [router]);

  const handleDelete = React.useCallback((row: ContentRequest) => {
    if (window.confirm('Are you sure you want to delete this content request?')) {
      deleteMutation.mutate(row.id);
    }
  }, [deleteMutation]);

  const { table } = useDataTable({
    data,
    columns: React.useMemo(() => getBlogColumns(handleView, handleDelete), [handleView, handleDelete]),
    pageCount: pagination?.total_pages ?? -1,
    initialState: {
      sorting: [{ id: 'created_at', desc: true }]
    },
    queryKeys: {
      page: 'page',
      perPage: 'pageSize',
      sort: 'sort',
      filters: 'filters',
      joinOperator: 'joinOperator'
    },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true
  });

  return (
    <div className="space-y-4">
      <DataTable table={table} />
    </div>
  );
}
