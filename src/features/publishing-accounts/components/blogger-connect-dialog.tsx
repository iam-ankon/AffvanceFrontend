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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { publishingApi } from '@/lib/api/publishing';
import type { BloggerBlog } from '@/types/publishing';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PUBLISHING_QUERY_KEYS } from '../hooks/use-publishing-accounts';

interface BloggerConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oauthState: string | null;
}

export function BloggerConnectDialog({
  open,
  onOpenChange,
  oauthState
}: BloggerConnectDialogProps) {
  const queryClient = useQueryClient();
  const [accountName, setAccountName] = useState('');
  const [selectedBlogId, setSelectedBlogId] = useState('');

  const sessionQuery = useQuery({
    queryKey: ['blogger-oauth-session', oauthState],
    queryFn: async () => {
      if (!oauthState) {
        throw new Error('Missing OAuth state');
      }
      const response = await publishingApi.getBloggerOAuthSession(oauthState);
      return response.data;
    },
    enabled: open && !!oauthState,
    retry: false
  });

  const blogs: BloggerBlog[] = sessionQuery.data?.blogs || [];

  useEffect(() => {
    if (!open) {
      setAccountName('');
      setSelectedBlogId('');
      return;
    }
    if (blogs.length === 1 && !selectedBlogId) {
      setSelectedBlogId(String(blogs[0].id));
      setAccountName(blogs[0].name);
    }
  }, [open, blogs, selectedBlogId]);

  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!oauthState || !selectedBlogId) {
        throw new Error('Select a Blogger blog to continue');
      }
      return publishingApi.connectBloggerAccount({
        state: oauthState,
        blog_id: selectedBlogId,
        account_name: accountName.trim() || undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUBLISHING_QUERY_KEYS.ACCOUNTS });
      toast.success('Blogger account connected successfully');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to connect Blogger account');
    }
  });

  const selectedBlog = blogs.find((blog) => String(blog.id) === selectedBlogId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Connect Blogger</DialogTitle>
          <DialogDescription>
            Choose which Google Blogger site Affvance should publish to.
          </DialogDescription>
        </DialogHeader>

        {sessionQuery.isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {sessionQuery.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            OAuth session expired or invalid. Please connect with Google again.
          </div>
        )}

        {sessionQuery.isSuccess && (
          <div className="space-y-4">
            {sessionQuery.data.google_email && (
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{sessionQuery.data.google_email}</span>
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="blogger-account-name">Account Name</Label>
              <Input
                id="blogger-account-name"
                placeholder="My Blogger Site"
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Blogger Site</Label>
              {blogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No Blogger blogs were found for this Google account.
                </p>
              ) : (
                <Select value={selectedBlogId} onValueChange={setSelectedBlogId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a blog" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogs.map((blog) => (
                      <SelectItem key={blog.id} value={String(blog.id)}>
                        {blog.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedBlog?.url && (
              <a
                href={selectedBlog.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {selectedBlog.url}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => connectMutation.mutate()}
            disabled={
              sessionQuery.isLoading ||
              !selectedBlogId ||
              connectMutation.isPending ||
              blogs.length === 0
            }
          >
            {connectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect Blogger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
