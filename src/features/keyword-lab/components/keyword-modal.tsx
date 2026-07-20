'use client';

import { Button } from '@/components/ui/button';
import { CommandGroup, CommandItem } from '@/components/ui/command';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { KeywordForm } from '@/features/keyword-lab/components/keyword-form';
import { useDebouncedCallback } from '@/lib/hooks/use-debounced-callback';
import { useKeywordLibrarySearch } from '@/lib/hooks/use-keyword-search';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

type KeywordModalProps = {
  search: string;
  selectedTitles: string[];
  maxSelections: number;
  onSelectKeyword: (keyword: string, id?: string) => void;
  showOpenKeywordLab?: boolean;
};

export default function KeywordModal({
  search,
  selectedTitles,
  maxSelections,
  onSelectKeyword,
  showOpenKeywordLab = true
}: KeywordModalProps) {
  const [isLabOpen, setIsLabOpen] = React.useState(false);
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);
  const setSearchDebounced = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
  }, 300);

  React.useEffect(() => {
    setSearchDebounced(search);
  }, [search, setSearchDebounced]);

  const canSelectMore = maxSelections === Infinity ? true : selectedTitles.length < maxSelections;

  const { data, isLoading } = useKeywordLibrarySearch({
    search: debouncedSearch,
    page: 1,
    page_size: 20
  });

  const handleAddKeywordsFromLab = (keywords: Array<{ id: string | null; title: string }>) => {
    keywords.forEach((k) => {
      onSelectKeyword(k.title, k.id || undefined);
    });
    setIsLabOpen(false);
  };

  return (
    <>
      {showOpenKeywordLab && (
        <Dialog open={isLabOpen} onOpenChange={setIsLabOpen}>
          <DialogTrigger asChild className="w-full">
            <Button variant="default" className="rounded-none">
              Open Keyword Lab
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[90vw] lg:max-w-[1000px]">
            <h3 className="text-center text-xl font-semibold">Keyword Lab</h3>
            <KeywordForm
              onSearchComplete={() => { }}
              onAddKeywords={handleAddKeywordsFromLab}
            />
          </DialogContent>
        </Dialog>
      )}

      <CommandGroup heading={showOpenKeywordLab ? 'Suggestions' : undefined}>
        {isLoading ? (
          <CommandItem disabled>Loading...</CommandItem>
        ) : (
          (data ?? []).map((item) => {
            const isSelected = selectedTitles.includes(item.keyword);
            return (
              <CommandItem
                key={item.id ?? item.keyword}
                value={item.keyword}
                disabled={!canSelectMore && !isSelected}
                onSelect={() => onSelectKeyword(item.keyword, item.id)}
              >
                <CheckIcon
                  className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                />
                <div className="flex flex-col">
                  <span>{item.keyword}</span>
                  <span className="text-muted-foreground text-xs">
                    Volume: {(item.search_volume ?? 0).toLocaleString()} • Difficulty:{' '}
                    {item.keyword_difficulty ?? 0} • CPC: ${(item.cpc ?? 0).toFixed(2)}
                  </span>
                </div>
              </CommandItem>
            );
          })
        )}
      </CommandGroup>
    </>
  );
}
