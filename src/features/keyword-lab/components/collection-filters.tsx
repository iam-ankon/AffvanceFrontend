'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { CollectionFilters as Filters } from '@/lib/hooks/use-keyword-collections';
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface CollectionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function CollectionFilters({ filters, onFiltersChange }: CollectionFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput || undefined, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        status: value === 'all' ? undefined : (value as 'DRAFT' | 'SAVED' | 'ARCHIVED'),
        page: 1
      });
    },
    [filters, onFiltersChange]
  );

  const handleOrderingChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        ordering: value === 'default' ? undefined : value,
        page: 1
      });
    },
    [filters, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    onFiltersChange({
      page: 1,
      page_size: filters.page_size
    });
  }, [filters.page_size, onFiltersChange]);

  const hasActiveFilters = filters.search || filters.status || filters.ordering;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 md:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search collections by title or seed keyword..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status ?? 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SAVED">Saved</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.ordering ?? 'default'}
          onValueChange={handleOrderingChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Newest First</SelectItem>
            <SelectItem value="-created_at">Oldest First</SelectItem>
            <SelectItem value="-total_keywords_saved">Most Keywords</SelectItem>
            <SelectItem value="-avg_search_volume">Highest Volume</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
            <SelectItem value="-title">Title (Z-A)</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-9"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
