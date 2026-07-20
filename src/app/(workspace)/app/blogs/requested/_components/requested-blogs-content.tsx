'use client';

import { Main } from '@/components/layout/main';
import Title from '@/components/title';
import { Button } from '@/components/ui/button';
import { RequestedBlogTable } from '@/features/blogs/components/requested/requested-blog-table';
import { useBlogs } from '@/lib/hooks/use-blogs';
import { useSearchParams } from 'next/navigation';

export function RequestedBlogsContent() {
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;

    const limit = Number(searchParams.get('pageSize')) || 10;

    const search = searchParams.get('filter') || '';

    interface BlogFilters {
        status?: 'draft' | 'published' | 'scheduled';
        authorId?: string;
        tag?: string;
        sortBy?: 'createdAt' | 'updatedAt' | 'title';
        sortOrder?: 'asc' | 'desc';
        [key: string]: string | undefined;
    }

    const filters: BlogFilters = {};

    const serializedFilters = Object.fromEntries(
        Object.entries(filters).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0
        )
    );

    const { data, isLoading, error } = useBlogs(page, limit, search, serializedFilters);

    if (error) {
        return (
            <div className="py-8 text-center">
                <p className="text-destructive">Error loading requests: {error.message}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <Main>
            {error && <div>Error: {error}</div>}

            <div className="mb-2 flex items-center justify-between">
                <Title title="Requested Blogs" />
                {/* <Button className="space-x-1" asChild>
          <Link href="/app/blogs/new" className="space-x-1">
            <span>Create New</span> <PlusIcon size={18} />
          </Link>
        </Button> */}
            </div>

            <RequestedBlogTable
                data={isLoading ? [] : data?.data?.results || []}
                pagination={data?.data?.pagination}
            />
        </Main>
    );
}
