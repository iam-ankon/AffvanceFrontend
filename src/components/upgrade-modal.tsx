'use client';

import { useCreditStore } from '@/lib/stores/credit-store';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

function getTitle(creditType: 'ai' | 'keyword' | null): string {
  if (creditType === 'ai') return 'Insufficient AI Credits';
  if (creditType === 'keyword') return 'Insufficient Keyword Credits';
  return 'Subscription Required';
}

export function UpgradeModal() {
  const router = useRouter();
  const { showUpgradeModal, upgradeMessage, creditType, closeUpgradeModal } = useCreditStore();

  return (
    <Dialog open={showUpgradeModal} onOpenChange={(open) => !open && closeUpgradeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>{getTitle(creditType)}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {upgradeMessage || 'You need more credits to complete this action. Upgrade your plan to continue.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={closeUpgradeModal}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              closeUpgradeModal();
              router.push('/app/subscription/plans');
            }}
          >
            View Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
