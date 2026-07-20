'use client';

import CreditDropdown from '@/components/credit-dropdown';
import DynamicBreadcrumb from '@/components/dynamic-breadcrumbs';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import AutopilotForm from '../../_components/autopilot-form';

export default function AutoPilotPage() {
  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center gap-2">
          <CreditDropdown />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <DynamicBreadcrumb />

        <Card className="mx-auto mt-5 w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="flex-none text-center text-2xl font-bold tracking-tight">
              One Click Single Article Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AutopilotForm />
          </CardContent>
        </Card>
      </Main>
    </>
  );
}
