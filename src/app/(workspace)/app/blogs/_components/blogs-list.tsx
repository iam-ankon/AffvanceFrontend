'use client';

import { Main } from '@/components/layout/main';
import Title from '@/components/title';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GeneratedBlogTable } from '@/features/blogs/components/generated/generated-blog-table';
import { useGeneratedBlogs } from '@/lib/hooks/use-blogs';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function BlogsList() {
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;

    const limit = Number(searchParams.get('pageSize')) || 10;

    const search = searchParams.get('filter') || '';

    // Tab state: 'published', 'generated' (draft), or 'scheduled'
    const [activeTab, setActiveTab] = useState<'published' | 'generated' | 'scheduled'>('published');

    interface BlogFilters {
        status?: 'generated' | 'publishing' | 'scheduled' | 'failed';
        model?: string;
        keyword?: string;
        [key: string]: string | undefined;
    }

    const filters: BlogFilters = {};

    const serializedFilters = Object.fromEntries(
        Object.entries(filters).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0
        )
    );

    const { data, isLoading, error } = useGeneratedBlogs(
        page,
        limit,
        search,
        serializedFilters,
        activeTab
    );

    if (error) {
        return (
            <div className="py-8 text-center">
                <p className="text-destructive">Error loading generated content: {error.message}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <Main className='w-full max-w-5xl mx-auto'>
            {error && <div>Error: {error}</div>}

            <div className="mb-2 flex items-center justify-between">
                <Title title="Blog List" />
                <Button className="space-x-1" asChild>
                    <Link href="/app/blogs/new" className="space-x-1">
                        <span>Create New</span> <PlusIcon size={18} />
                    </Link>
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'published' | 'generated' | 'scheduled')} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="generated">Draft</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                </TabsList>

                <TabsContent value="published">
                    <GeneratedBlogTable
                        data={isLoading ? [] : data?.data?.results || []}
                        pagination={data?.data?.pagination}
                    />
                </TabsContent>

                <TabsContent value="generated">
                    <GeneratedBlogTable
                        data={isLoading ? [] : data?.data?.results || []}
                        pagination={data?.data?.pagination}
                    />
                </TabsContent>

                <TabsContent value="scheduled">
                    <GeneratedBlogTable
                        data={isLoading ? [] : data?.data?.results || []}
                        pagination={data?.data?.pagination}
                    />
                </TabsContent>
            </Tabs>
        </Main>
    );
}
