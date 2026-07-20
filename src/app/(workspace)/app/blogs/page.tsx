import CreditDropdown from '@/components/credit-dropdown';
import { Header } from '@/components/layout/header';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Suspense } from 'react';
import { BlogsList } from './_components/blogs-list';

export const dynamic = 'force-dynamic';

export default function Blogs() {
  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center gap-2">
          <CreditDropdown />
          <ProfileDropdown />
        </div>
      </Header>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <BlogsList />
      </Suspense>
    </>
  );
}
