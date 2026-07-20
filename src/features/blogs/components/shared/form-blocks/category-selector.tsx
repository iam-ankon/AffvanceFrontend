'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { usePublishingAccounts, useWordPressCategories } from '@/lib/hooks/use-publishing';
import { Loader2, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  accountId?: string | null;
  platformType?: string | null;
  value?: number | null;
  onChange?: (value: number | null, categoryName?: string | null) => void;
  className?: string;
  required?: boolean;
}

export default function CategorySelector({
  accountId = null,
  platformType = null,
  value = null,
  onChange,
  className = '',
  required = false
}: CategorySelectorProps) {
  const [forceRefresh, setForceRefresh] = useState(false);
  const { data: accountsData } = usePublishingAccounts(1, 100);

  const resolvedPlatformType = useMemo(() => {
    if (platformType) {
      return platformType;
    }
    if (!accountId) {
      return null;
    }
    const account = accountsData?.data?.results?.find((item) => item.id === accountId);
    return account?.platform_type ?? null;
  }, [platformType, accountId, accountsData]);

  const isWordPress = resolvedPlatformType === 'wordpress';
  const shouldFetchCategories = isWordPress && !!accountId;

  const { data, isLoading, error, refetch } = useWordPressCategories(
    accountId,
    forceRefresh,
    shouldFetchCategories
  );

  const categories = data?.data?.categories || [];

  if (resolvedPlatformType && !isWordPress) {
    return null;
  }

  const handleChange = (value: string) => {
    if (value === 'none' || value === '') {
      if (onChange) onChange(null, null);
    } else {
      const categoryId = parseInt(value);
      const category = categories.find((cat) => cat.id === categoryId);
      if (onChange) onChange(categoryId, category?.name || null);
    }
  };

  const handleRefresh = async () => {
    setForceRefresh(true);
    await refetch();
    setForceRefresh(false);
  };

  if (!accountId) {
    return (
      <div className={className}>
        <div className="space-y-2">
          <Label>
            Category {required && <span className="text-destructive">*</span>}
            {!required && ' (Optional)'}
          </Label>
          <div className="rounded-md border border-muted bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              Select a publishing account first to choose a category
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            Category {required && <span className="text-destructive">*</span>}
            {!required && ' (Optional)'}
          </Label>
          {!isLoading && categories.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || forceRefresh}
              className="h-7 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${forceRefresh ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-md border p-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading categories...</span>
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3">
            <p className="text-sm text-destructive">Failed to load categories</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-md border border-muted bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              No categories found for this account
            </p>
          </div>
        ) : (
          <Select
            value={value ? value.toString() : required ? '' : 'none'}
            onValueChange={handleChange}
          >
            <SelectTrigger className={cn('w-full', required && !value && 'border-destructive')}>
              <SelectValue
                placeholder={required ? 'Select a category (required)' : 'Select a category'}
              />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {!required && <SelectItem value="none">None (Use default)</SelectItem>}
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{category.name}</span>
                    {category.count > 0 && (
                      <span className="text-xs text-muted-foreground">({category.count})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <p className="text-xs text-muted-foreground">WordPress category for this blog post</p>
      </div>
    </div>
  );
}
