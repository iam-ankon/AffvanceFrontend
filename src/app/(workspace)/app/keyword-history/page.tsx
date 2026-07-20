import CreditDropdown from '@/components/credit-dropdown';
import { Header } from '@/components/layout/header';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Suspense } from 'react';
import { KeywordHistoryContent } from './_components/keyword-history-content';

export const dynamic = 'force-dynamic';

export default function KeywordHistoryPage() {
  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center gap-2">
          <CreditDropdown />
          <ProfileDropdown />
        </div>
      </Header>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <KeywordHistoryContent />
      </Suspense>
    </>
  );
}
