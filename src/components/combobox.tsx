'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

// ComboboxOption now has a generic "meta" type instead of any
export interface ComboboxOption<T = string, M = unknown> {
  value: T;
  label: string;
  meta?: M; // optional extra data
}

interface ComboboxProps<T = string, M = unknown> {
  options: ComboboxOption<T, M>[];
  value: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  className?: string; // applies to PopoverContent
  triggerClassName?: string;
  renderOptionLabel?: (opt: ComboboxOption<T, M>, isSelected: boolean) => React.ReactNode;
  disabled?: boolean;
}

export function Combobox<T = string, M = unknown>({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  className,
  triggerClassName,
  renderOptionLabel,
  disabled = false
}: ComboboxProps<T, M>) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find((o) => o.value === value) || null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-[140px] justify-between', triggerClassName)}
          disabled={disabled}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn('w-[250px] p-0', className)}>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <CommandItem
                    key={String(opt.value)}
                    value={String(opt.value)}
                    onSelect={() => {
                      onChange(isSelected ? null : opt.value);
                      setOpen(false);
                    }}
                  >
                    {renderOptionLabel ? (
                      renderOptionLabel(opt, isSelected)
                    ) : (
                      <>
                        {opt.label}
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
