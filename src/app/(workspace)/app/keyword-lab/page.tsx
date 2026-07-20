import { Suspense } from 'react';
import { KeywordLabContent } from './_components/keyword-lab-content';

export const dynamic = 'force-dynamic';

export default function KeywordLabPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <KeywordLabContent />
    </Suspense>
  );
}
