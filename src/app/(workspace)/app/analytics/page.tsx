import { Suspense } from 'react';

import { DashboardAnalyticsView } from '../_components/new-dashboard/dashboard-analytics-view';
import { DashboardWorkspaceLayout } from '../_components/new-dashboard/dashboard-workspace-layout';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-slate-600">Loading…</div>}>
      <DashboardWorkspaceLayout>
        <DashboardAnalyticsView />
      </DashboardWorkspaceLayout>
    </Suspense>
  );
}
