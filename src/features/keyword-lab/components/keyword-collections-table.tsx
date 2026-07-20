'use client';

import { DataTable } from '@/components/data-table/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import type { KeywordCollection } from '@/lib/hooks/use-keyword-collections';

import { getKeywordCollectionColumns } from './keyword-collection-columns';

interface KeywordCollectionsTableProps {
  data: KeywordCollection[];
  pageCount: number;
  onDelete?: (collection: KeywordCollection) => void;
}

export function KeywordCollectionsTable({
  data,
  pageCount,
  onDelete
}: KeywordCollectionsTableProps) {
  const { table } = useDataTable({
    data,
    columns: getKeywordCollectionColumns({ onDelete }),
    pageCount,
    initialState: {
      sorting: [],
      pagination: {
        pageSize: 10,
        pageIndex: 0
      }
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

