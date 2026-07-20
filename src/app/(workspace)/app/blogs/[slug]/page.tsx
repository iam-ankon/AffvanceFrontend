'use client';

import { Main } from '@/components/layout/main';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useGetBlogDetails } from '@/lib/hooks/use-blogs';
import { use } from 'react';

import { BlogContentArea } from '../_components/blog-content-area';
import { BlogCreatorSidebar } from '../_components/blog-creator-sidebar';

export default function BlogDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: blogDetails, isLoading, error, refetch } = useGetBlogDetails(slug);

  if (error) {
    return (
      <Main fixed className="flex items-center justify-center p-2">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">Failed to load blog</h2>
          <p className="text-muted-foreground mb-4">
            There was an error fetching the blog content.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </Main>
    );
  }

  return (
    <>
      <Main fixed className="p-2">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
          <ResizablePanel defaultSize={70} minSize={50}>
            {isLoading ? (
              <div className="flex h-full flex-col bg-white">
                {/* Header skeleton */}
                <div className="shrink-0 border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-8 w-64" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                </div>
                {/* Editor area skeleton */}
                <div className="flex-1 overflow-hidden p-6 gap-6 flex flex-col">
                  <Skeleton className="h-10 w-full" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-60 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </div>
              </div>
            ) : (
              <BlogContentArea
                id={slug}
                featuredImage={blogDetails?.data?.featured_image_url}
                content={blogDetails?.data?.html_content}
                title={blogDetails?.data?.title}
              />
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            {isLoading ? (
              <div className="flex h-full flex-col p-6 gap-8 border-l bg-white">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ) : (
              <BlogCreatorSidebar data={blogDetails?.data} />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </Main>
    </>
  );
}
