'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandInput, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import KeywordModal from '@/features/keyword-lab/components/keyword-modal';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

export interface KeywordOption {
  id?: string | null;
  title: string;
}

interface KeywordComboboxProps {
  value: KeywordOption[];
  onChange: (value: KeywordOption[] | ((prev: KeywordOption[]) => KeywordOption[])) => void;
  placeholder?: string;
  className?: string;
  maxSelections?: number; // Set to 1 for single selection, Infinity for unlimited
  showKeywordLab?: boolean;
}

export default function KeywordCombobox({
  value,
  onChange,
  placeholder = 'Click here to choose keywords or type your own...',
  className = '',
  maxSelections = Infinity,
  showKeywordLab = true
}: KeywordComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  React.useEffect(() => {
    if (inputValue.length > 0 && !open) {
      setOpen(true);
    }
  }, [inputValue, open]);

  const handleSelect = React.useCallback(
    (selectedKeyword: string, id?: string) => {
      const newOption: KeywordOption = {
        title: selectedKeyword,
        id: id ?? null
      };

      if (maxSelections === 1) {
        // Single selection mode - replace current value
        onChange([newOption]);
        setInputValue('');
        setOpen(false);
      } else {
        // Multiple selection mode
        if (value.some((k) => k.title === selectedKeyword)) {
          onChange(value.filter((k) => k.title !== selectedKeyword));
        } else if (value.length < maxSelections) {
          onChange([...value, newOption]);
        }
        setInputValue('');
      }
    },
    [value, onChange, maxSelections]
  );

  const handleRemove = React.useCallback(
    (keywordToRemove: string) => {
      onChange(value.filter((k) => k.title !== keywordToRemove));
    },
    [value, onChange]
  );

  const handleInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        const newOption: KeywordOption = {
          title: trimmedInput,
          id: null
        };

        if (maxSelections === 1) {
          // Single selection mode - replace current value
          onChange([newOption]);
          setInputValue('');
          setOpen(false);
        } else {
          // Multiple selection mode
          if (!value.some((k) => k.title === trimmedInput) && value.length < maxSelections) {
            onChange([...value, newOption]);
          }
          setInputValue('');
        }
      } else if (e.key === 'Backspace' && inputValue.length === 0 && value.length > 0) {
        e.preventDefault();
        if (maxSelections === 1) {
          // Single selection mode - clear the value
          onChange([]);
        } else {
          // Multiple selection mode - remove last item
          onChange(value.slice(0, -1));
        }
      }
    },
    [inputValue, value, onChange, maxSelections]
  );

  return (
    <div className={cn('space-y-2', className)}>
      {/* Integrated input field + combobox with badges inside */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'border-input bg-background ring-offset-background focus-within:ring-ring flex min-h-10 w-full cursor-text flex-wrap gap-2 rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2',
              value.length > 0 ? 'items-start pt-2' : 'items-center'
            )}
          >
            {value.map((keyword) => (
              <Badge key={keyword.title} variant="secondary" className="pr-1">
                {keyword.title}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:bg-destructive hover:text-destructive-foreground ml-1 h-3 w-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(keyword.title);
                  }}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <div className="flex min-w-0 flex-1 items-center">
              <input
                className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent outline-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={
                  value.length === 0
                    ? maxSelections === 1
                      ? 'Click here to choose a keyword...'
                      : 'Click here to choose keywords or type your own...'
                    : ''
                }
              />
              <ChevronDownIcon className="h-4 w-4 flex-shrink-0 opacity-50" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={
                maxSelections === 1
                  ? 'Search from saved keywords...'
                  : value.length >= maxSelections
                    ? `Maximum ${maxSelections} keywords reached`
                    : 'Search or press Enter to add custom'
              }
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 py-4">
                  <p className="text-sm text-muted-foreground">
                    {maxSelections === 1
                      ? 'No keywords found'
                      : value.length >= maxSelections
                        ? `Maximum ${maxSelections} keywords reached.`
                        : 'No keywords found'}
                  </p>
                  {inputValue.trim() && value.length < maxSelections && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const trimmedInput = inputValue.trim();
                        const newOption: KeywordOption = {
                          title: trimmedInput,
                          id: null
                        };
                        if (maxSelections === 1) {
                          onChange([newOption]);
                          setInputValue('');
                          setOpen(false);
                        } else {
                          if (!value.some((k) => k.title === trimmedInput)) {
                            onChange([...value, newOption]);
                          }
                          setInputValue('');
                        }
                      }}
                    >
                      Add "{inputValue.trim()}"
                    </Button>
                  )}
                  {!inputValue.trim() && value.length === 0 && showKeywordLab && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href="/app/keyword-lab" onClick={() => setOpen(false)}>
                        Search Keyword Lab
                      </Link>
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <KeywordModal
                search={inputValue}
                selectedTitles={value.map((v) => v.title)}
                maxSelections={maxSelections}
                onSelectKeyword={(keyword, id) => handleSelect(keyword, id)}
                showOpenKeywordLab={showKeywordLab}
              />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
