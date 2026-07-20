'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { KeywordCollection } from '@/lib/hooks/use-keyword-collections';
import { format } from 'date-fns';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  DollarSign,
  Edit,
  FileText,
  Globe,
  Languages,
  Trash2,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface CollectionHeaderProps {
  collection: KeywordCollection;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CollectionHeader({ collection, onEdit, onDelete }: CollectionHeaderProps) {
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
    <div className="space-y-4">
      {/* Back Button and Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <Link href="/app/keyword-history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Keywords
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}

        

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Collection Title and Description */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{collection.title}</h1>
          <Badge className={statusColors[collection.status]}>{collection.status}</Badge>
        </div>
        {collection.description && (
          <p className="mt-2 text-muted-foreground">{collection.description}</p>
        )}
      </div>

      {/* Collection Details Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Seed Keyword */}
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="mr-2 h-4 w-4" />
                Seed Keyword
              </div>
              <div className="text-lg font-semibold">{collection.seed_keyword}</div>
            </div>

            {/* Location & Language */}
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Globe className="mr-2 h-4 w-4" />
                Location & Language
              </div>
              <div className="text-lg font-semibold">
                {collection.location_name}
                <span className="mx-2 text-muted-foreground">|</span>
                <Languages className="inline h-4 w-4 mr-1" />
                {collection.language_name}
              </div>
            </div>

            {/* Total Keywords */}
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <BarChart3 className="mr-2 h-4 w-4" />
                Total Keywords
              </div>
              <div className="text-lg font-semibold">
                {formatNumber(collection.total_keywords_saved)}
              </div>
            </div>

            {/* Created Date */}
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Created
              </div>
              <div className="text-lg font-semibold">
                {format(new Date(collection.created_at), 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg Volume</div>
                <div className="font-semibold">{formatNumber(collection.avg_search_volume)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg CPC</div>
                <div className="font-semibold">{formatCurrency(collection.avg_cpc)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg Competition</div>
                <div className="font-semibold">
                  {collection.avg_competition
                    ? (() => {
                        const comp =
                          typeof collection.avg_competition === 'string'
                            ? parseFloat(collection.avg_competition)
                            : collection.avg_competition;
                        return !isNaN(comp) ? `${Math.round(comp * 100)}%` : 'N/A';
                      })()
                    : 'N/A'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-orange-100">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">API Cost</div>
                <div className="font-semibold">{formatCurrency(collection.api_cost)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
