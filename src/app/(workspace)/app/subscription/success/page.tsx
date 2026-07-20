'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { toast } from 'sonner';

function SuccessContent() {
  const searchParams = useSearchParams();
  // Paddle appends _ptxn=<transaction_id> to the return URL after checkout
  const transactionId = searchParams.get('_ptxn');

  useEffect(() => {
    toast.success('Subscription activated! Welcome aboard.');
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="h-20 w-20 text-green-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">You&apos;re all set!</h1>
          <p className="text-muted-foreground text-lg">
            Your subscription has been activated successfully.
          </p>
        </div>

        {transactionId && (
          <p className="text-muted-foreground text-sm">
            Transaction ID:{' '}
            <span className="font-mono text-xs">{transactionId}</span>
          </p>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/app/subscription">View My Subscription</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/app/blogs">Start Creating Content</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}