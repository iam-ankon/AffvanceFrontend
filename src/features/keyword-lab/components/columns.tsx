'use client';

import { DataTableColumnHeader } from '@/components/data-table/column-header';
import type { Keyword } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

export const columns: ColumnDef<Keyword>[] = [
  {
    accessorKey: 'keyword',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Keyword" />,
    cell: ({ row }) => (
      <Link
        href={row.original.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primary hover:underline"
      >
        {row.getValue('keyword')}
      </Link>
    ),
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'volume',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Search Volume" />,
    cell: ({ row }) => {
      return <div className="text-right">{row.original.volume.toLocaleString()}</div>;
    },
    enableSorting: true
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Difficulty" />,
    cell: ({ row }) => {
      const difficulty = row.original.difficulty;
      return (
        <div className="text-right">
          <span
            className={cn(
              'rounded-full px-2 py-1 text-xs font-medium',
              difficulty < 30
                ? 'bg-green-100 text-green-800'
                : difficulty < 60
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            )}
          >
            {difficulty}/100
          </span>
        </div>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'cpc',
    header: ({ column }) => <DataTableColumnHeader column={column} title="CPC" />,
    cell: ({ row }) => {
      return <div className="text-right">{row.original.cpc}</div>;
    },
    enableSorting: true
  },
  {
    accessorKey: 'position',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Position" />,
    cell: ({ row }) => {
      const position = row.original.position;
      return (
        <div className="text-right">
          <span
            className={cn(
              'rounded-full px-2 py-1 text-xs font-medium',
              position <= 3
                ? 'bg-green-100 text-green-800'
                : position <= 10
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
            )}
          >
            #{position}
          </span>
        </div>
      );
    },
    enableSorting: true
  }
];
