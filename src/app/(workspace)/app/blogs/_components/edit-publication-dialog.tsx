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
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ScheduledPublication } from '@/lib/api/types';
import PublishingAccountSelector from '@/features/blogs/components/shared/form-blocks/publishing-account-selector';
import CategorySelector from '@/features/blogs/components/shared/form-blocks/category-selector';
import ScheduleTimeSelector from '@/features/blogs/components/shared/form-blocks/schedule-time-selector';
import {
  usePublishNow,
  useCancelPublication,
  useUpdatePublication
} from '@/lib/hooks/use-publishing';
import { format } from 'date-fns';

interface EditPublicationDialogProps {
  publication: ScheduledPublication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPublicationDialog({ publication, open, onOpenChange }: EditPublicationDialogProps) {
  const initializeEditData = (): {
    accountId: string;
    categoryId: number | null;
    categoryName: string | null;
    scheduleMode: 'now' | 'later';
    scheduledTime: Date | null;
  } => ({
    accountId: typeof publication.publishing_account === 'object' 
      ? publication.publishing_account.id 
      : publication.publishing_account,
    categoryId: publication.category_id || null,
    categoryName: null,
    scheduleMode: (publication.scheduled_time ? 'later' : 'now') as 'now' | 'later',
    scheduledTime: publication.scheduled_time ? new Date(publication.scheduled_time) : null
  });

  const [editData, setEditData] = useState(initializeEditData());

  const publishNow = usePublishNow(publication.id);
  const cancelPublication = useCancelPublication(publication.id);
  const updatePublication = useUpdatePublication(publication.id);

  // Reset edit data when dialog opens
  useEffect(() => {
    if (open) {
      setEditData(initializeEditData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleUpdatePublication = async () => {
    if (!editData.categoryId) {
      alert('Please select a category. Category is required.');
      return;
    }

    const scheduledTime =
      editData.scheduleMode === 'later' && editData.scheduledTime
        ? editData.scheduledTime.toISOString()
        : editData.scheduleMode === 'now'
        ? new Date().toISOString()
        : editData.scheduledTime?.toISOString() || new Date().toISOString();

    await updatePublication.mutateAsync({
      scheduled_time: scheduledTime,
      category_id: editData.categoryId
    });

    onOpenChange(false);
  };

  const handlePublishNow = async () => {
    await publishNow.mutateAsync();
    onOpenChange(false);
  };

  const handleCancel = async () => {
    await cancelPublication.mutateAsync();
    onOpenChange(false);
  };

  const accountName = typeof publication.publishing_account === 'object' 
    ? publication.publishing_account.name 
    : 'Unknown Account';
  const accountUrl = typeof publication.publishing_account === 'object'
    ? publication.publishing_account.site_url 
    : publication.published_url || 'No URL';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden my-4">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-100">
          <DialogTitle>Edit Publication Schedule</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Manage your scheduled publication or publish immediately
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Current Schedule Info */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-gray-900">{accountName}</span>
                  <span className="text-xs text-gray-600">{accountUrl}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  Scheduled for {format(new Date(publication.scheduled_time), 'PPp')}
                </span>
              </div>
              {publication.status === 'failed' && publication.error_message && (
                <div className="text-xs text-red-600 bg-red-50 rounded p-2 mt-2">
                  {publication.error_message}
                </div>
              )}
            </div>

            <Separator />

            {/* Edit Form */}
            <div className="space-y-4">
              <PublishingAccountSelector
                value={editData.accountId}
                onChange={(value: string) => setEditData((prev) => ({ ...prev, accountId: value }))}
              />
              <CategorySelector
                accountId={editData.accountId}
                value={editData.categoryId}
                onChange={(categoryId: number | null, categoryName?: string | null) =>
                  setEditData((prev) => ({ ...prev, categoryId, categoryName: categoryName ?? null }))
                }
                required
              />
              <ScheduleTimeSelector
                accountId={editData.accountId}
                scheduleMode={editData.scheduleMode}
                scheduledTime={editData.scheduledTime}
                onScheduleModeChange={(mode: 'now' | 'later') => 
                  setEditData((prev) => ({ ...prev, scheduleMode: mode }))
                }
                onScheduledTimeChange={(time: Date | null) => 
                  setEditData((prev) => ({ ...prev, scheduledTime: time }))
                }
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="px-6 py-4 flex-shrink-0 gap-2 flex-col sm:flex-row border-t border-gray-100 bg-gray-50/50">
          <div className="flex gap-2 w-full sm:w-auto">
            {publication.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePublishNow}
                  disabled={publishNow.isPending}
                  className="flex-1 sm:flex-none"
                >
                  {publishNow.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish Now
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelPublication.isPending}
                  className="sm:w-auto"
                >
                  {cancelPublication.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  )}
                </Button>
              </>
            )}
            {publication.status === 'failed' && (
              <>
                <Button
                  variant="default"
                  onClick={handlePublishNow}
                  disabled={publishNow.isPending}
                  className="flex-1 sm:flex-none"
                >
                  {publishNow.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Retry Publishing'
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelPublication.isPending}
                >
                  {cancelPublication.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
           
            <Button 
              onClick={handleUpdatePublication} 
              disabled={updatePublication.isPending || (publication.status !== 'pending' && publication.status !== 'failed')}
              className="flex-1 sm:flex-none"
            >
              {updatePublication.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Update Schedule
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
