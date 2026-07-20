'use client';

import CreditDropdown from '@/components/credit-dropdown';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { TeamDashboard } from '@/features/teams/components/team-dashboard';

export default function TeamPage() {
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
            <h1 className="text-2xl font-bold tracking-tight">Team</h1>
            <p className="text-muted-foreground">
              Manage your team members and invitations
            </p>
          </div>
          <TeamDashboard />
        </div>
      </Main>
    </>
  );
}
