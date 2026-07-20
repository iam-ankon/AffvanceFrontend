'use client';

import DynamicBreadcrumb from '@/components/dynamic-breadcrumbs';
import { Main } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { DeleteCollectionDialog } from '@/features/keyword-lab/components/delete-collection-dialog';
import { KeywordCollectionsTable } from '@/features/keyword-lab/components/keyword-collections-table';
import {
    type KeywordCollection,
    useCollections
} from '@/lib/hooks/use-keyword-collections';
import { FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function KeywordHistoryContent() {
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;

    const [selectedCollection, setSelectedCollection] = useState<KeywordCollection | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: collectionsData, isLoading } = useCollections({
        page,
        page_size: pageSize
    });

    const collections = collectionsData?.results ?? [];
    const totalCount = collectionsData?.count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const handleDelete = (collection: KeywordCollection) => {
        setSelectedCollection(collection);
        setIsDeleteDialogOpen(true);
    };

    return (
        <Main>
            <DynamicBreadcrumb />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Keywords</h1>
                        <p className="text-muted-foreground">
                            Manage and organize your saved keyword collections
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/app/keyword-lab">
                            <FlaskConical className="mr-2 h-4 w-4" />
                            Generate Keywords
                        </Link>
                    </Button>
                </div>

                {/* Collections Table */}
                <KeywordCollectionsTable
                    data={isLoading ? [] : collections}
                    pageCount={totalPages}
                    onDelete={handleDelete}
                />
            </div>

            {/* Dialogs */}
            <DeleteCollectionDialog
                collection={selectedCollection}
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            />
        </Main>
    );
}
