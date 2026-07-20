'use client';

import CreditDropdown from '@/components/credit-dropdown';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { CreditPackCards } from '@/features/subscriptions/components/credit-pack-cards';
import { PlanCards } from '@/features/subscriptions/components/plan-cards';
import { useActiveSubscription } from '@/features/subscriptions/hooks/use-subscriptions';

export default function PlansPage() {
  const { data: activeSub } = useActiveSubscription();
  const hasActiveSub = !!activeSub && activeSub.is_active;

  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center gap-2">
          <CreditDropdown />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mx-auto max-w-6xl space-y-12">
          <section>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
              <p className="text-muted-foreground">Choose a plan that fits your needs</p>
            </div>
            <PlanCards />
          </section>

          {/* Credit packs are top-ups for existing subscribers — shown only
              when the user has an active subscription. */}
          {hasActiveSub && (
            <section id="credit-packs" className="scroll-mt-20">
              <div className="mb-6 border-t pt-8">
                <h2 className="text-xl font-bold tracking-tight">Need more credits?</h2>
                <p className="text-muted-foreground text-sm">
                  Top up with a one-time credit pack. Credits never expire and stack on top
                  of your subscription.
                </p>
              </div>
              <CreditPackCards />
            </section>
          )}
        </div>
      </Main>
    </>
  );
}