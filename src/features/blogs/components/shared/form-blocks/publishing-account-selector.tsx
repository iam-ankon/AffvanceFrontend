'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { usePublishingAccounts } from '@/lib/hooks/use-publishing';
import { Loader2 } from 'lucide-react';

interface PublishingAccountSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabledAccountIds?: string[];
}

export default function PublishingAccountSelector({
  value = '',
  onChange,
  className = '',
  disabledAccountIds = []
}: PublishingAccountSelectorProps) {
  const { data, isLoading, error } = usePublishingAccounts(1, 100);

  const accounts = data?.data?.results || [];

  const handleChange = (value: string) => {
    if (onChange) {
      // Convert "none" back to empty string for the parent component
      onChange(value === 'none' ? '' : value);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label>Publishing Account</Label>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-md border p-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading accounts...</span>
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3">
            <p className="text-sm text-destructive">Failed to load publishing accounts</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-md border border-muted bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              No publishing accounts found. Create one in Settings first.
            </p>
          </div>
        ) : (
          <Select value={value || 'none'} onValueChange={handleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a publishing account" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              <SelectItem value="none">None (Don&apos;t schedule now)</SelectItem>
              {accounts.map((account) => (
                <SelectItem
                  key={account.id}
                  value={account.id}
                  disabled={disabledAccountIds.includes(account.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {account.account_name || account.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {account.site_url || account.platform_type}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <p className="text-xs text-muted-foreground">
          Select where to publish this blog post
        </p>
      </div>
    </div>
  );
}
