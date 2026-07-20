import { Suspense } from 'react';
import { PublishingAccountsContent } from './_components/publishing-accounts-content';

export const dynamic = 'force-dynamic';

export default function PublishingAccountsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <PublishingAccountsContent />
    </Suspense>
  );
}
