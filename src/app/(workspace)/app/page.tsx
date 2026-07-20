import { Suspense } from 'react';
import { DashboardContent } from './_components/dashboard-content';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
