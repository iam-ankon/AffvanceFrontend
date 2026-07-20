'use client';

import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { Badge } from '@/components/ui/badge';
import { ContentRequest } from '@/lib/api/types';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertCircle,
  CheckCircle,
  CircleDashed,
  Clock,
  Text,
  Eye,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

type BlogColumnDef = ColumnDef<ContentRequest> & {
  meta?: {
    label: string;
    variant?: string;
    icon?: React.ComponentType<{ className?: string }>;
    options?: Array<{
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }>;
  };
};

export function getBlogColumns(
  onView?: (row: ContentRequest) => void,
  onDelete?: (row: ContentRequest) => void
): BlogColumnDef[] {
  return [
    {
      accessorKey: 'title',
      id: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => {
        const title = row.getValue('title') as string;
        return (
          <div
            className="flex max-w-[300px] flex-col p-1.5 -ml-1.5 rounded-md cursor-pointer hover:bg-slate-100 transition-colors group"
            onClick={() => onView?.(row.original)}
          >
            <span
              className="truncate font-medium group-hover:text-indigo-600 transition-colors"
              title={title}
            >
              {title}
            </span>
            <span className="text-muted-foreground text-xs opacity-70">{row.original.id}</span>
          </div>
        );
      },
      meta: {
        label: 'Title',
        placeholder: 'Search titles...',
        variant: 'text',
        icon: Text
      },
      enableColumnFilter: true,
      enableSorting: false
    },
    {
      accessorKey: 'generation_type_display',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <div className="text-sm">{row.getValue('generation_type_display')}</div>,
      enableSorting: false
    },
    {
      accessorKey: 'structure_type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Structure" />,
      cell: ({ row }) => <div className="text-sm">{row.getValue('structure_type')}</div>,
      enableSorting: false
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => {
        const date = row.getValue('created_at');
        return (
          <div className="text-sm">
            {date ? new Date(date as string).toLocaleDateString() : '-'}
          </div>
        );
      },
      enableSorting: false
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = (row.getValue('status') as string) || 'draft';
        const statusDisplay = row.original.status_display || status;

        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
        let icon = CircleDashed;

        switch (status.toLowerCase()) {
          case 'completed':
          case 'published':
            variant = 'default'; // Using default (usually black/primary) for success/completed
            icon = CheckCircle;
            break;
          case 'failed':
            variant = 'destructive';
            icon = AlertCircle;
            break;
          case 'processing':
          case 'generating':
            variant = 'secondary';
            icon = Clock;
            break;
          default:
            variant = 'outline';
            icon = CircleDashed;
        }

        return (
          <Badge variant={variant} className="flex w-fit items-center gap-1">
            {statusDisplay}
          </Badge>
        );
      },
      meta: {
        label: 'Status',
        variant: 'multiSelect',
        options: [
          { label: 'Draft', value: 'draft', icon: CircleDashed },
          { label: 'Processing', value: 'processing', icon: Clock },
          { label: 'Completed', value: 'completed', icon: CheckCircle },
          { label: 'Failed', value: 'failed', icon: AlertCircle }
        ],
        icon: CircleDashed
      },
      enableColumnFilter: true,
      enableSorting: false
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => onView?.(row.original)} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              <span>View</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(row.original)}
              className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];
}
