import { Suspense } from 'react';

import { DashboardMonetisationView } from '../_components/new-dashboard/dashboard-monetisation-view';
import { DashboardWorkspaceLayout } from '../_components/new-dashboard/dashboard-workspace-layout';

export const dynamic = 'force-dynamic';

export default function MonetisationPage() {
  return (
    <Suspense fallback={<div className="p-4 text-slate-600">Loading…</div>}>
      <DashboardWorkspaceLayout>
        <DashboardMonetisationView />
      </DashboardWorkspaceLayout>
    </Suspense>
  );
}
