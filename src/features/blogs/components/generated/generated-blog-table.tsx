'use client';

import { DataTablePagination } from '@/components/data-table/pagination';
import { useDataTable } from '@/hooks/use-data-table';
import type { GeneratedContent, PaginationMetadata } from '@/lib/api/types';

import { GeneratedBlogCard } from './generated-blog-card';
import { getGeneratedBlogColumns } from './generated-blog-columns';

interface GeneratedBlogTableProps {
  data: GeneratedContent[];
  pagination?: PaginationMetadata;
}

export function GeneratedBlogTable({ data, pagination }: GeneratedBlogTableProps) {
  const { table } = useDataTable({
    data,
    columns: getGeneratedBlogColumns(),
    pageCount: pagination?.total_pages ?? -1,
    initialState: {
      sorting: []
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

  const rows = table.getRowModel().rows;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Blog Cards Grid */}
      <div className="flex flex-col gap-4">
        {rows.length > 0 ? (
          rows.map((row) => (
            <GeneratedBlogCard key={row.id} blog={row.original} row={row} />
          ))
        ) : (
          <div className="flex h-24 items-center justify-center rounded-lg border text-muted-foreground">
            No blogs found.
          </div>
        )}
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} className="mt-auto" />
    </div>
  );
}
