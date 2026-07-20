'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ApiError, api } from '@/lib/api/client';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import PublishingAccountSelector from '@/features/blogs/components/shared/form-blocks/publishing-account-selector';
import CategorySelector from '@/features/blogs/components/shared/form-blocks/category-selector';
import ScheduleTimeSelector from '@/features/blogs/components/shared/form-blocks/schedule-time-selector';
import { useCreatePublication, usePublishingAccounts } from '@/lib/hooks/use-publishing';
import { toast } from 'sonner';

interface PublishingDialogProps {
  contentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublishingDialog({ contentId, open, onOpenChange }: PublishingDialogProps) {
  const [newPublicationData, setNewPublicationData] = useState({
    accountId: '',
    categoryId: null as number | null,
    categoryName: null as string | null,
    scheduleMode: 'now' as 'now' | 'later',
    scheduledTime: null as Date | null
  });

  const createPublication = useCreatePublication();
  const { data: accountsData } = usePublishingAccounts(1, 100);
  const accounts = accountsData?.data?.results || [];

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === newPublicationData.accountId),
    [accounts, newPublicationData.accountId]
  );
  const selectedPlatformType = selectedAccount?.platform_type || null;
  const categoryRequired = selectedPlatformType === 'wordpress';

  const handleCreatePublication = async () => {
    if (!newPublicationData.accountId) {
      return;
    }

    if (categoryRequired && !newPublicationData.categoryId) {
      return;
    }

    const publishNow = newPublicationData.scheduleMode === 'now';
    const scheduledTime =
      newPublicationData.scheduleMode === 'later' && newPublicationData.scheduledTime
        ? newPublicationData.scheduledTime.toISOString()
        : new Date().toISOString();

    const response = await createPublication.mutateAsync({
      generated_content: contentId,
      publishing_account: newPublicationData.accountId,
      scheduled_time: scheduledTime,
      category_id: newPublicationData.categoryId
    });

    // "Publish" (not "Schedule") means the person wants this to go out right
    // now, not sit as a pending record until the periodic scheduler sweep
    // (which runs every few minutes) happens to pick it up. Trigger the
    // actual publish task immediately.
    if (publishNow) {
      const publicationId = response?.data?.id;
      if (publicationId) {
        try {
          await api.post(`/content/publishing/scheduled/${publicationId}/publish-now/`, {});
          toast.success('Publishing started');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Publication was scheduled, but publishing now failed to start';
          toast.error(errorMessage);
          throw new ApiError(errorMessage, 500);
        }
      }
    }

    onOpenChange(false);
    setNewPublicationData({
      accountId: '',
      categoryId: null,
      categoryName: null,
      scheduleMode: 'now',
      scheduledTime: null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Publication</DialogTitle>
          <DialogDescription>
            Choose where and when to publish this blog post
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <PublishingAccountSelector
            value={newPublicationData.accountId}
            onChange={(value) =>
              setNewPublicationData((prev) => ({ ...prev, accountId: value }))
            }
          />
          <CategorySelector
            accountId={newPublicationData.accountId}
            platformType={selectedPlatformType}
            value={newPublicationData.categoryId}
            onChange={(categoryId, categoryName) =>
              setNewPublicationData((prev) => ({ ...prev, categoryId, categoryName: categoryName ?? null }))
            }
            required={categoryRequired}
          />
          {selectedPlatformType === 'devto' && (
            <p className="text-xs text-muted-foreground">
              Dev.to tags are generated automatically from your post keyword when publishing.
            </p>
          )}
          <ScheduleTimeSelector
            accountId={newPublicationData.accountId}
            scheduleMode={newPublicationData.scheduleMode}
            scheduledTime={newPublicationData.scheduledTime}
            onScheduleModeChange={(mode) =>
              setNewPublicationData((prev) => ({ ...prev, scheduleMode: mode }))
            }
            onScheduledTimeChange={(time) =>
              setNewPublicationData((prev) => ({ ...prev, scheduledTime: time }))
            }
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePublication}
            disabled={
              !newPublicationData.accountId ||
              (categoryRequired && !newPublicationData.categoryId) ||
              createPublication.isPending
            }
          >
            {createPublication.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {newPublicationData.scheduleMode === 'now' ? 'Publish' : 'Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
