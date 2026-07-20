'use client';

import { Suspense } from 'react';

import { DashboardHomeView } from './new-dashboard/dashboard-home-view';
import { DashboardWorkspaceLayout } from './new-dashboard/dashboard-workspace-layout';

export function DashboardContent() {
  return (
    <Suspense fallback={<div className="p-4 text-slate-600">Loading…</div>}>
      <DashboardWorkspaceLayout>
        <DashboardHomeView />
      </DashboardWorkspaceLayout>
    </Suspense>
  );
}
