'use client';

import CreditDropdown from '@/components/credit-dropdown';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { SubscriptionDashboard } from '@/features/subscriptions/components/subscription-dashboard';

export default function SubscriptionPage() {
  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center gap-2">
          <CreditDropdown />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
            <p className="text-muted-foreground">
              Manage your subscription and credits
            </p>
          </div>
          <SubscriptionDashboard />
        </div>
      </Main>
    </>
  );
}