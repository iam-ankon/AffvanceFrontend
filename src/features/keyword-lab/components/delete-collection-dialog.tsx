'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import type { KeywordCollection } from '@/lib/hooks/use-keyword-collections';
import { useDeleteCollection } from '@/lib/hooks/use-keyword-collections';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteCollectionDialogProps {
  collection: KeywordCollection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectAfterDelete?: boolean;
}

export function DeleteCollectionDialog({
  collection,
  open,
  onOpenChange,
  redirectAfterDelete = false
}: DeleteCollectionDialogProps) {
  const router = useRouter();
  const deleteMutation = useDeleteCollection();

  const handleDelete = async () => {
    if (!collection) return;

    try {
      await deleteMutation.mutateAsync(collection.id);
      onOpenChange(false);

      if (redirectAfterDelete) {
        router.push('/app/keyword-history');
      }
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Delete error:', error);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this collection?</AlertDialogTitle>
          <AlertDialogDescription>
            {collection && (
              <span className="block">
                You are about to delete the collection <strong>&quot;{collection.title}&quot;</strong>.
              </span>
            )}
            <span className="mt-2 block text-sm">
              This will archive the collection and all {collection?.total_keywords_saved ?? 0} keywords in it.
              This action can be reversed by restoring from archived collections.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Collection'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
