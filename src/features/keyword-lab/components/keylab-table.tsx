'use client';

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

interface KeywordData {
  keyword: string;
  se_type: string;
  search_volume: number;
  competition: number;
  competition_level: 'LOW' | 'MEDIUM' | 'HIGH';
  cpc: number;
  keyword_difficulty: number;
  last_updated_time: string;
  main_search_intent: string;
}

interface KeyLabTableProps {
  data: KeywordData[];
  isLoading?: boolean;
  selectedKeywords?: string[];
  onSelectionChange?: (keywords: string[]) => void;
}

export function KeyLabTable({
  data,
  isLoading = false,
  selectedKeywords = [],
  onSelectionChange
}: KeyLabTableProps) {
  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 px-2 py-1 rounded';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded';
      case 'LOW':
        return 'text-green-600 bg-green-50 px-2 py-1 rounded';
      default:
        return '';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCPC = (cpc: number) => {
    return `$${cpc.toFixed(2)}`;
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const allKeywords = data.map((item) => item.keyword);
      onSelectionChange(allKeywords);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectKeyword = (keyword: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedKeywords, keyword]);
    } else {
      onSelectionChange(selectedKeywords.filter((k) => k !== keyword));
    }
  };

  const isAllSelected = data.length > 0 && selectedKeywords.length === data.length;
  const isSomeSelected = selectedKeywords.length > 0 && selectedKeywords.length < data.length;

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border">
        <Table className="bg-background">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={isSomeSelected ? 'data-[state=checked]:bg-primary' : ''}
                />
              </TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Competition</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>Difficulty</TableHead>

              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="bg-background overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
                className={isSomeSelected ? 'data-[state=checked]:bg-primary' : ''}
              />
            </TableHead>
            <TableHead className="w-48">Keyword</TableHead>

            <TableHead className="w-24 text-right">Search Volume</TableHead>
            <TableHead className="w-24 text-right">Competition</TableHead>
            <TableHead className="w-20">Level</TableHead>
            <TableHead className="w-20 text-right">CPC</TableHead>
            <TableHead className="w-20 text-center">Difficulty</TableHead>

            <TableHead className="w-28">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <Checkbox
                    checked={selectedKeywords.includes(item.keyword)}
                    onCheckedChange={(checked) =>
                      handleSelectKeyword(item.keyword, checked as boolean)
                    }
                    aria-label={`Select ${item.keyword}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.keyword}</TableCell>

                <TableCell className="text-right font-semibold">
                  {formatNumber(item.search_volume)}
                </TableCell>
                <TableCell className="text-right">{(item.competition * 100).toFixed(2)}%</TableCell>
                <TableCell>
                  <span className={getCompetitionColor(item.competition_level)}>
                    {item.competition_level}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">{formatCPC(item.cpc)}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold">{item.keyword_difficulty}</span>
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(item.last_updated_time)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-muted-foreground py-8 text-center">
                No keywords found. Try adjusting your search criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
