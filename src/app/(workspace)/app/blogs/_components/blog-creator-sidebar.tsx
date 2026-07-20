'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ContentRequest, ScheduledPublication } from '@/lib/api/types';
import {
  AlignLeft,
  ArrowLeft,
  Calendar,
  FileText,
  Globe,
  Languages,
  LayoutTemplate,
  MessageSquare,
  Sparkles,
  Target,
  Send,
  Clock,
  ExternalLink,
  Loader2,
  Trash2,
  Edit2
} from 'lucide-react';
import {
  useContentPublications,
  usePublishNow,
  useCancelPublication,
  useUpdatePublication
} from '@/lib/hooks/use-publishing';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ContentScoreCard } from './content-score-card';
import PublishingAccountSelector from '@/features/blogs/components/shared/form-blocks/publishing-account-selector';
import CategorySelector from '@/features/blogs/components/shared/form-blocks/category-selector';
import ScheduleTimeSelector from '@/features/blogs/components/shared/form-blocks/schedule-time-selector';

interface BlogCreatorSidebarProps {
  data?: ContentRequest & {
    html_content?: string;
    featured_image_url?: string | null;
    keyword_suggestion_info?: {
      keyword: string;
      search_volume: number;
      keyword_difficulty: number;
      competition: number;
    };
  };
}

// Publishing Section Component
function PublishingSection({ contentId }: { contentId: string }) {
  const { data, isLoading } = useContentPublications(contentId);

  const publications = data?.data?.publications || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
        <Send className="h-4 w-4 text-gray-500" />
        <h3>Content Status</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      ) : publications.length === 0 ? (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-600 font-medium mb-1">Not published yet</p>
          <p className="text-xs text-gray-500">This content hasn&apos;t been scheduled for publication.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {publications.map((publication) => (
            <PublicationItem key={publication.id} publication={publication} />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual Publication Item Component
function PublicationItem({ publication }: { publication: ScheduledPublication }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Note: API response includes account_name and site_url directly on publication object
  const publicationWithExtras = publication as ScheduledPublication & {
    account_name?: string;
    site_url?: string;
    category_name?: string | null;
  };

  // Initialize edit data from publication
  const initializeEditData = (): {
    accountId: string;
    categoryId: number | null;
    categoryName: string | null;
    scheduleMode: 'now' | 'later';
    scheduledTime: Date | null;
  } => ({
    accountId:
      typeof publication.publishing_account === 'string'
        ? publication.publishing_account
        : typeof publication.publishing_account === 'object'
        ? publication.publishing_account.id
        : '',
    categoryId: publication.category_id || null,
    categoryName: publicationWithExtras.category_name || null,
    scheduleMode: 'later',
    scheduledTime: publication.scheduled_time ? new Date(publication.scheduled_time) : new Date()
  });

  const [editData, setEditData] = useState(initializeEditData());

  const publishNow = usePublishNow(publication.id);
  const cancelPublication = useCancelPublication(publication.id);
  const updatePublication = useUpdatePublication(publication.id);

  // Reset edit data when dialog opens
  const handleOpenEditDialog = () => {
    setEditData(initializeEditData());
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'publishing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'published':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleUpdatePublication = async () => {
    const scheduledTime =
      editData.scheduleMode === 'later' && editData.scheduledTime
        ? editData.scheduledTime.toISOString()
        : new Date().toISOString();

    await updatePublication.mutateAsync({
      scheduled_time: scheduledTime,
      category_id: editData.categoryId
    });

    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div className={`rounded-lg border p-3 space-y-2 ${getStatusColor(publication.status)}`}>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold">
                {publicationWithExtras.account_name ||
                  (typeof publication.publishing_account === 'object'
                    ? publication.publishing_account.name
                    : null) ||
                  'Unknown Account'}
              </span>
              <a
                href={
                  publication.published_url ||
                  publicationWithExtras.site_url ||
                  (typeof publication.publishing_account === 'object'
                    ? publication.publishing_account.site_url
                    : null) ||
                  '#'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs opacity-75 underline"
              >
                {publication.published_url ||
                  publicationWithExtras.site_url ||
                  (typeof publication.publishing_account === 'object'
                    ? publication.publishing_account.site_url
                    : null) ||
                  'No URL'}
              </a>
            </div>
            
          </div>
          <div className="flex items-center gap-1 text-xs opacity-75">
            <Clock className="h-3 w-3" />
            <span>
              {publication.status === 'published' && publication.published_at
                ? `Published ${format(new Date(publication.published_at), 'PPp')}`
                : `Scheduled for ${format(new Date(publication.scheduled_time), 'PPp')}`}
            </span>
          </div>
        </div>

        {publication.error_message && (
          <div className="text-xs opacity-90 bg-white/50 rounded p-2">
            {publication.error_message}
          </div>
        )}

        {publication.status === 'pending' && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs flex-1 bg-white"
              onClick={() => publishNow.mutate()}
              disabled={publishNow.isPending}
            >
              {publishNow.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Send className="h-3 w-3 mr-1" />
                  Publish Now
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs bg-white"
              onClick={handleOpenEditDialog}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs bg-white"
              onClick={() => cancelPublication.mutate()}
              disabled={cancelPublication.isPending}
            >
              {cancelPublication.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}

        {publication.status === 'failed' && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs flex-1 bg-white"
              onClick={() => publishNow.mutate()}
              disabled={publishNow.isPending}
            >
              {publishNow.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Retry'
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs bg-white"
              onClick={() => cancelPublication.mutate()}
              disabled={cancelPublication.isPending}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Publication</DialogTitle>
            <DialogDescription>
              Update the publishing account, category, or schedule time
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
            />
            <ScheduleTimeSelector
              accountId={editData.accountId}
              scheduleMode={editData.scheduleMode}
              scheduledTime={editData.scheduledTime}
              onScheduleModeChange={(mode: 'now' | 'later') => setEditData((prev) => ({ ...prev, scheduleMode: mode }))}
              onScheduledTimeChange={(time: Date | null) => setEditData((prev) => ({ ...prev, scheduledTime: time }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePublication} disabled={updatePublication.isPending}>
              {updatePublication.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function BlogCreatorSidebar({ data }: BlogCreatorSidebarProps) {
  if (!data) return null;

  return (
    <ScrollArea className="flex h-full flex-col border-r border-gray-200 bg-white">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6">
        <Link href="/app/blogs" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blogs</span>
        </Link>
      </div>
      <div className="flex-1 space-y-8 p-6">
      
      <PublishingSection contentId={data.id} />
        <Separator />
        <ContentScoreCard contentId={data.id} />
   
      </div>
    </ScrollArea>
  );
}
