'use client';

import CreditDropdown from '@/components/credit-dropdown';
import DynamicBreadcrumb from '@/components/dynamic-breadcrumbs';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { KeywordForm } from '@/features/keyword-lab/components/keyword-form';

export function KeywordLabContent() {
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

                <div className="space-y-6">
                    <KeywordForm onSearchComplete={() => { }} />
                </div>
            </Main>
        </>
    );
}
