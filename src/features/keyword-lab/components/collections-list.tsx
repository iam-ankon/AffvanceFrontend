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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { KeywordCollection } from '@/lib/hooks/use-keyword-collections';
import { format } from 'date-fns';
import { Download, Edit, FileText, FlaskConical, FolderOpen, MoreVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface CollectionsListProps {
  collections: KeywordCollection[];
  isLoading?: boolean;
  onEdit?: (collection: KeywordCollection) => void;
  onDelete?: (collection: KeywordCollection) => void;
  onExport?: (collection: KeywordCollection) => void;
}

export function CollectionsList({
  collections,
  isLoading,
  onEdit,
  onDelete,
  onExport
}: CollectionsListProps) {
  const statusColors = {
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

  if (isLoading) {
    return <CollectionsListSkeleton />;
  }

  if (!collections || collections.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Collection</TableHead>
            <TableHead>Seed Keyword</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Language</TableHead>
            <TableHead className="text-right">Keywords</TableHead>
            <TableHead className="text-right">Avg Volume</TableHead>
            <TableHead className="text-right">Avg CPC</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <TableRow key={collection.id}>
              <TableCell>
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
              </TableCell>
              <TableCell className="font-mono text-sm">{collection.seed_keyword}</TableCell>
              <TableCell className="text-sm">{collection.location_name}</TableCell>
              <TableCell className="text-sm">{collection.language_name}</TableCell>
              <TableCell className="text-right font-medium">
                {formatNumber(collection.total_keywords_saved)}
              </TableCell>
              <TableCell className="text-right">{formatNumber(collection.avg_search_volume)}</TableCell>
              <TableCell className="text-right">{formatCurrency(collection.avg_cpc)}</TableCell>
              <TableCell className="text-center">
                <Badge className={statusColors[collection.status]}>{collection.status}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(collection.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
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
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(collection)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onExport && (
                      <DropdownMenuItem onClick={() => onExport(collection)}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(collection)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CollectionsListSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Collection</TableHead>
            <TableHead>Seed Keyword</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Language</TableHead>
            <TableHead className="text-right">Keywords</TableHead>
            <TableHead className="text-right">Avg Volume</TableHead>
            <TableHead className="text-right">Avg CPC</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="mt-1 h-3 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-12" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-16" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-12" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FolderOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-lg font-semibold">No saved keywords yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Generate and save keywords to start building your keyword collections.
      </p>
      <Button
        asChild
        className="mt-6"
      >
        <Link href="/app/keyword-lab">
          <FlaskConical className="mr-2 h-4 w-4" />
          Generate Keywords
        </Link>
      </Button>
    </div>
  );
}
