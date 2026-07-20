'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { KeywordCollection } from '@/lib/hooks/use-keyword-collections';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { FileText, MoreVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ColumnOptions {
  onDelete?: (collection: KeywordCollection) => void;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  SAVED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800'
};

const formatNumber = (num?: number | string) => {
  if (num === undefined || num === null) return 'N/A';
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('en-US').format(numValue);
};

const formatCurrency = (num?: number | string) => {
  if (num === undefined || num === null) return 'N/A';
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return 'N/A';
  return `$${numValue.toFixed(2)}`;
};

export function getKeywordCollectionColumns(
  options: ColumnOptions = {}
): ColumnDef<KeywordCollection>[] {
  const { onDelete } = options;

  return [
    {
      accessorKey: 'title',
      header: 'Collection',
      cell: ({ row }) => {
        const collection = row.original;
        return (
          <div className="min-w-[200px]">
            <Link
              href={`/app/keyword-history/${collection.id}`}
              className="font-medium hover:underline"
            >
              {collection.title}
            </Link>
            {collection.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                {collection.description}
              </p>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      accessorKey: 'seed_keyword',
      header: 'Seed Keyword',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.seed_keyword}</span>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      accessorKey: 'location_name',
      header: 'Location',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.location_name}</span>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      accessorKey: 'language_name',
      header: 'Language',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.language_name}</span>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      accessorKey: 'total_keywords_saved',
      header: () => <div className="text-right">Keywords</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatNumber(row.original.total_keywords_saved)}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      accessorKey: 'avg_search_volume',
      header: () => <div className="text-right">Avg Volume</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.original.avg_search_volume)}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      accessorKey: 'avg_cpc',
      header: () => <div className="text-right">Avg CPC</div>,
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.original.avg_cpc)}</div>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      accessorKey: 'status',
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge className={statusColors[row.original.status]}>
            {row.original.status}
          </Badge>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.created_at), 'MMM d, yyyy')}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'actions',
      header: () => <div className="w-[80px]">Actions</div>,
      cell: ({ row }) => {
        const collection = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/app/keyword-history/${collection.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(collection)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableColumnFilter: false
    }
  ];
}

