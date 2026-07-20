'use client';

import CreditDropdown from '@/components/credit-dropdown';
import DynamicBreadcrumb from '@/components/dynamic-breadcrumbs';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Skeleton } from '@/components/ui/skeleton';
import { CollectionHeader } from '@/features/keyword-lab/components/collection-header';
import { DeleteCollectionDialog } from '@/features/keyword-lab/components/delete-collection-dialog';
import { EditCollectionDialog } from '@/features/keyword-lab/components/edit-collection-dialog';
import { KeywordsTable } from '@/features/keyword-lab/components/keywords-table';
import {
  useCollection,
  useUpdateKeywords
} from '@/lib/hooks/use-keyword-collections';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionId = params.id as string;

  const { data: collection, isLoading } = useCollection(collectionId);
  const updateKeywordsMutation = useUpdateKeywords();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    if (!confirm('Are you sure you want to delete this keyword?')) return;

    try {
      await updateKeywordsMutation.mutateAsync({
        collectionId,
        payload: {
          delete_keyword_ids: [keywordId]
        }
      });
      toast.success('Keyword deleted successfully');
    } catch (error) {
      console.error('Delete keyword error:', error);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header fixed>
          <div className="ml-auto flex items-center gap-2">
            <CreditDropdown />
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <DynamicBreadcrumb />
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </Main>
      </>
    );
  }

  if (!collection) {
    return (
      <>
        <Header fixed>
          <div className="ml-auto flex items-center gap-2">
            <CreditDropdown />
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <DynamicBreadcrumb />
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Collection not found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The collection you&apos;re looking for doesn&apos;t exist or has been deleted.
              </p>
            </div>
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center gap-2">
          <CreditDropdown />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <DynamicBreadcrumb />

        <div className="space-y-6">
          {/* Collection Header */}
          <CollectionHeader
            collection={collection}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Keywords Table */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Keywords</h2>
            <KeywordsTable
              keywords={collection.keywords ?? []}
              isLoading={updateKeywordsMutation.isPending}
              onDelete={handleDeleteKeyword}
            />
          </div>
        </div>
      </Main>

      {/* Dialogs */}
      <EditCollectionDialog
        collection={collection}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <DeleteCollectionDialog
        collection={collection}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        redirectAfterDelete={true}
      />
    </>
  );
}
