'use client';

import { DataTableFacetedFilter } from '@/components/data-table/faceted-filter';
import { DataTableViewOptions } from '@/components/data-table/view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import type { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import * as React from 'react';

import { countryList, tourStatus, tourTypes } from '../data';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const { searchTerm, setSearchTerm, debouncedValue } = useDebouncedSearch();

  const handleReset = () => {
    table.resetColumnFilters();
    table.setGlobalFilter('');
    setSearchTerm('');
  };

  React.useEffect(() => {
    table.getColumn('title')?.setFilterValue(debouncedValue);
    table.setGlobalFilter(debouncedValue);
  }, [debouncedValue, table]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder="Search by title"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="bg-background h-8 w-[150px] shadow-none lg:w-[250px]"
        />
        <div className="flex gap-x-2">
          {table.getColumn('tourType') && (
            <DataTableFacetedFilter
              column={table.getColumn('tourType')}
              title="Tour Type"
              options={tourTypes}
            />
          )}
          {table.getColumn('country') && (
            <DataTableFacetedFilter
              column={table.getColumn('country')}
              title="Country"
              options={countryList}
            />
          )}
        </div>
        {table.getColumn('published') && (
          <DataTableFacetedFilter
            column={table.getColumn('published')}
            title="Published"
            options={tourStatus}
          />
        )}
        {isFiltered && (
          <Button variant="ghost" onClick={handleReset} className="h-8 px-2 lg:px-3">
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
