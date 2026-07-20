'use client';

import { DollarSign } from 'lucide-react';
import Link from 'next/link';

export function DashboardMonetisationView() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <DollarSign size={40} />
      </div>
      <h3 className="mb-2 text-2xl font-bold text-slate-900">Monetisation Hub</h3>
      <p className="max-w-md text-slate-500">
        Track your affiliate earnings and link performance in real-time. Connect your Amazon Associates or ShareASale
        account to get started.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/app/subscription/plans"
          className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-colors hover:bg-violet-700"
        >
          Connect Affiliate Account
        </Link>
        <Link
          href="/app/subscription"
          className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Billing &amp; plans
        </Link>
      </div>
    </div>
  );
}
