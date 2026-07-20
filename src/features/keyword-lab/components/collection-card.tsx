'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { KeywordCollection } from '@/lib/hooks/use-keyword-collections';
import { format } from 'date-fns';
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Edit,
  FileText,
  Globe,
  Languages,
  MoreVertical,
  TrendingUp,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

interface CollectionCardProps {
  collection: KeywordCollection;
  onEdit?: (collection: KeywordCollection) => void;
  onDelete?: (collection: KeywordCollection) => void;
  onExport?: (collection: KeywordCollection) => void;
}

export function CollectionCard({ collection, onEdit, onDelete, onExport }: CollectionCardProps) {
  const statusColors = {
    DRAFT: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    SAVED: 'bg-green-100 text-green-800 hover:bg-green-100',
    ARCHIVED: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
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

  return (
    <Card className="group relative flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <Link href={`/app/keyword-history/${collection.id}`}>
              <CardTitle className="line-clamp-1 cursor-pointer hover:underline">
                {collection.title}
              </CardTitle>
            </Link>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[collection.status]}>{collection.status}</Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
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
        </div>

        {collection.description && (
          <CardDescription className="line-clamp-2">{collection.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <FileText className="mr-2 h-4 w-4" />
            <span className="font-medium">Seed:</span>
            <span className="ml-1">{collection.seed_keyword}</span>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center">
              <Globe className="mr-1.5 h-4 w-4" />
              <span>{collection.location_name}</span>
            </div>
            <div className="flex items-center">
              <Languages className="mr-1.5 h-4 w-4" />
              <span>{collection.language_name}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Keywords</div>
              <div className="text-sm font-semibold">{formatNumber(collection.total_keywords_saved)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Avg Volume</div>
              <div className="text-sm font-semibold">
                {formatNumber(collection.avg_search_volume)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-green-100">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Avg CPC</div>
              <div className="text-sm font-semibold">{formatCurrency(collection.avg_cpc)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-100">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Created</div>
              <div className="text-sm font-semibold">
                {format(new Date(collection.created_at), 'MMM d')}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
        <div className="flex w-full items-center justify-between">
          <span>
            {collection.created_by
              ? `By ${collection.created_by.first_name ?? collection.created_by.email}`
              : 'Unknown'}
          </span>
          <span>API Cost: {formatCurrency(collection.api_cost)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
