import { Suspense } from 'react';
import { LanguagesContent } from './_components/languages-content';

export const dynamic = 'force-dynamic';

export default function LanguagesPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <LanguagesContent />
    </Suspense>
  );
}
