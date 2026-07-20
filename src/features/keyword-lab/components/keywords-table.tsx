'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { KeywordCollectionItem } from '@/lib/hooks/use-keyword-collections';
import { format } from 'date-fns';
import { Check, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface KeywordsTableProps {
  keywords: KeywordCollectionItem[];
  isLoading?: boolean;
  onDelete?: (keywordId: string) => void;
}

export function KeywordsTable({ keywords, isLoading, onDelete }: KeywordsTableProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const getCompetitionColor = (level?: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num?: number | string) => {
    if (num === undefined || num === null) return 'N/A';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return 'N/A';
    return new Intl.NumberFormat('en-US').format(numValue);
  };

  const formatCPC = (cpc?: number | string) => {
    if (cpc === undefined || cpc === null) return 'N/A';
    const numValue = typeof cpc === 'string' ? parseFloat(cpc) : cpc;
    if (isNaN(numValue)) return 'N/A';
    return `$${numValue.toFixed(2)}`;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeywords(keywords.map((kw) => kw.id));
    } else {
      setSelectedKeywords([]);
    }
  };

  const handleSelectKeyword = (keywordId: string, checked: boolean) => {
    if (checked) {
      setSelectedKeywords([...selectedKeywords, keywordId]);
    } else {
      setSelectedKeywords(selectedKeywords.filter((id) => id !== keywordId));
    }
  };

  const isAllSelected = keywords.length > 0 && selectedKeywords.length === keywords.length;

  if (isLoading) {
    return <KeywordsTableSkeleton />;
  }

  if (!keywords || keywords.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No keywords in this collection yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedKeywords.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
          <span className="text-sm text-muted-foreground">
            {selectedKeywords.length} keyword(s) selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedKeywords([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead className="text-right">Volume</TableHead>
              <TableHead className="text-right">Competition</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead className="text-right">Difficulty</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-center">Custom</TableHead>
              <TableHead className="text-center">Content</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((keyword) => (
              <TableRow key={keyword.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedKeywords.includes(keyword.id)}
                    onCheckedChange={(checked) =>
                      handleSelectKeyword(keyword.id, checked as boolean)
                    }
                    aria-label={`Select ${keyword.keyword}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{keyword.keyword}</TableCell>
                <TableCell className="text-right">
                  {formatNumber(keyword.search_volume)}
                </TableCell>
                <TableCell className="text-right">
                  {keyword.competition !== undefined && keyword.competition !== null
                    ? (() => {
                        const comp =
                          typeof keyword.competition === 'string'
                            ? parseFloat(keyword.competition)
                            : keyword.competition;
                        return !isNaN(comp) ? `${Math.round(comp * 100)}%` : 'N/A';
                      })()
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getCompetitionColor(keyword.competition_level)}
                  >
                    {keyword.competition_level || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCPC(keyword.cpc)}</TableCell>
                <TableCell className="text-right">
                  {keyword.keyword_difficulty ?? 'N/A'}
                </TableCell>
                <TableCell>
                  {keyword.user_priority ? (
                    <Badge
                      variant="secondary"
                      className={getPriorityColor(keyword.user_priority)}
                    >
                      {keyword.user_priority}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {keyword.is_custom_keyword ? (
                    <Check className="inline h-4 w-4 text-green-600" />
                  ) : (
                    <X className="inline h-4 w-4 text-gray-400" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {keyword.content_generated ? (
                    <div className="flex flex-col items-center">
                      <Check className="h-4 w-4 text-green-600" />
                      {keyword.content_generated_at && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(keyword.content_generated_at), 'MMM d')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <X className="inline h-4 w-4 text-gray-400" />
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {keyword.created_at ? format(new Date(keyword.created_at), 'MMM d, yyyy') : 'N/A'}
                </TableCell>
                <TableCell>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => onDelete(keyword.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function KeywordsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Skeleton className="h-4 w-4" />
            </TableHead>
            <TableHead>Keyword</TableHead>
            <TableHead className="text-right">Volume</TableHead>
            <TableHead className="text-right">Competition</TableHead>
            <TableHead>Level</TableHead>
            <TableHead className="text-right">CPC</TableHead>
            <TableHead className="text-right">Difficulty</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-center">Custom</TableHead>
            <TableHead className="text-center">Content</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-16" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-12" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-4" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-4" />
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
