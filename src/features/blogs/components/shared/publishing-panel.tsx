'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ApiError, api } from '@/lib/api/client';
import {
  useContentPublications,
  usePublishNow,
  useCancelPublication,
  useCreatePublication,
  usePublishingAccounts
} from '@/lib/hooks/use-publishing';
import { Loader2, ExternalLink, Clock, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import type { ScheduledPublication } from '@/lib/api/types';
import PublishingAccountSelector from './form-blocks/publishing-account-selector';
import CategorySelector from './form-blocks/category-selector';
import ScheduleTimeSelector from './form-blocks/schedule-time-selector';
import { toast } from 'sonner';

interface PublishingPanelProps {
  contentId: string;
  className?: string;
}

export default function PublishingPanel({ contentId, className = '' }: PublishingPanelProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPublicationData, setNewPublicationData] = useState({
    accountId: '',
    categoryId: null as number | null,
    scheduleMode: 'now' as 'now' | 'later',
    scheduledTime: null as Date | null
  });

  const { data, isLoading, error } = useContentPublications(contentId);
  const createPublication = useCreatePublication();
  const { data: accountsData } = usePublishingAccounts(1, 100);
  const accounts = accountsData?.data?.results || [];

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === newPublicationData.accountId),
    [accounts, newPublicationData.accountId]
  );
  const selectedPlatformType = selectedAccount?.platform_type || null;
  const categoryRequired = selectedPlatformType === 'wordpress';

  const publications = data?.data?.publications || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'publishing':
        return 'default';
      case 'published':
        return 'success';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

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

    setIsCreateDialogOpen(false);
    setNewPublicationData({
      accountId: '',
      categoryId: null,
      scheduleMode: 'now',
      scheduledTime: null
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Publishing Status</CardTitle>
            <CardDescription>Manage where this blog is published</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Publication
              </Button>
            </DialogTrigger>
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
                  onChange={(value) =>
                    setNewPublicationData((prev) => ({ ...prev, categoryId: value }))
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
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
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
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading publications...</span>
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">Failed to load publications</p>
          </div>
        ) : publications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              This blog hasn&apos;t been published yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Publication
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {publications.map((publication) => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PublicationCard({ publication }: { publication: ScheduledPublication }) {
  const publishNow = usePublishNow(publication.id);
  const cancelPublication = useCancelPublication(publication.id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handlePublishNow = async () => {
    await publishNow.mutateAsync();
  };

  const handleCancel = async () => {
    await cancelPublication.mutateAsync();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'publishing':
        return 'default';
      case 'published':
        return 'success';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{publication.publishing_account.name}</h4>
            <Badge variant={getStatusBadgeVariant(publication.status as string) as "default" | "destructive" | "outline" | "secondary" | null | undefined}>
              {publication.status_display}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {publication.publishing_account.site_url}
          </p>
        </div>
        {publication.status === 'published' && publication.published_url && (
          <Button size="sm" variant="ghost" asChild>
            <a href={publication.published_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {publication.status === 'published' && publication.published_at
              ? `Published ${format(new Date(publication.published_at), 'PPp')}`
              : `Scheduled for ${format(new Date(publication.scheduled_time), 'PPp')}`}
          </span>
        </div>
      </div>

      {publication.error_message && (
        <div className="rounded-md bg-destructive/10 p-2">
          <p className="text-xs text-destructive">{publication.error_message}</p>
        </div>
      )}

      {publication.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={handlePublishNow}
            disabled={publishNow.isPending}
          >
            {publishNow.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Publish Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={cancelPublication.isPending}
          >
            {cancelPublication.isPending ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-3 w-3" />
            )}
            Cancel
          </Button>
        </div>
      )}

      {publication.status === 'failed' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={handlePublishNow}
            disabled={publishNow.isPending}
          >
            {publishNow.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Retry
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={cancelPublication.isPending}
          >
            {cancelPublication.isPending ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-3 w-3" />
            )}
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
